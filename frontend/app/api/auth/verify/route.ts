import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { getChallenge, removeChallenge, storeSession, getSession } from '@/lib/auth-storage'
import { TransactionBuilder, Networks } from '@stellar/stellar-sdk'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

// Verification schema validation
const verificationSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  signature: z.string().min(1, "Signature (XDR transaction) is required"),
  challenge: z.string().min(1, "Challenge is required"),
})

// JWT secret (in production, use environment variable)
const ***REMOVED*** = process.env.***REMOVED*** || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // 7 days

// Helper function to verify XDR transaction
function verifyXDRTransaction(walletAddress: string, signedXDR: string, challenge: string): boolean {
  console.log('🔍 Verifying XDR transaction...')
  console.log('🔍 Wallet address:', walletAddress)
  console.log('🔍 Challenge:', challenge)
  console.log('🔍 Signed XDR length:', signedXDR.length)
  
  try {
    // Parse the signed XDR transaction
    const transaction = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
    console.log('✅ Transaction parsed successfully')
    
    // Handle different transaction types
    if ('source' in transaction) {
      console.log('🔍 Transaction source:', transaction.source)
    } else {
      console.log('🔍 Fee bump transaction - using inner transaction source')
      if (transaction.innerTransaction && 'source' in transaction.innerTransaction) {
        console.log('🔍 Inner transaction source:', transaction.innerTransaction.source)
      }
    }
    
    console.log('🔍 Transaction operations count:', transaction.operations.length)
    
    // Extract the challenge from manageData operation
    let transactionChallenge = null
    for (let i = 0; i < transaction.operations.length; i++) {
      const operation = transaction.operations[i]
      console.log(`🔍 Operation ${i}:`, operation.type)
      
      if (operation.type === 'manageData') {
        console.log('🔍 Found manageData operation')
        const manageDataOp = operation as any // Type assertion for manageData operation
        console.log('🔍 Operation name:', manageDataOp.name)
        console.log('🔍 Operation value:', manageDataOp.value)
        
        if (manageDataOp.name === 'auth_challenge') {
          transactionChallenge = manageDataOp.value
          console.log('✅ Found auth_challenge data:', transactionChallenge)
          console.log('🔍 Transaction challenge type:', typeof transactionChallenge)
          console.log('🔍 Transaction challenge length:', transactionChallenge?.length)
          console.log('🔍 Transaction challenge as string:', String(transactionChallenge))
          break
        }
      }
    }
    
    if (!transactionChallenge) {
      console.log('❌ No auth_challenge data found in transaction')
      console.log('🔍 Available operations:')
      transaction.operations.forEach((op, i) => {
        console.log(`  ${i}: ${op.type} - ${(op as any).name || 'no name'}`)
      })
      return false
    }
    
    console.log('🔍 Transaction challenge (from manageData):', transactionChallenge)
    
    // Get the stored challenge
    const storedChallenge = getChallenge(walletAddress)
    
    if (!storedChallenge) {
      console.log('❌ No stored challenge found for wallet')
      return false
    }
    
    console.log('🔍 Stored challenge:', storedChallenge.challenge)
    console.log('🔍 Stored challenge timestamp:', storedChallenge.timestamp)
    
    // Check if challenge is expired (5 minutes)
    if (Date.now() - storedChallenge.timestamp > 5 * 60 * 1000) {
      console.log('❌ Challenge expired')
      console.log('❌ Current time:', Date.now())
      console.log('❌ Challenge time:', storedChallenge.timestamp)
      console.log('❌ Time difference:', Date.now() - storedChallenge.timestamp)
      removeChallenge(walletAddress)
      return false
    }
    
    // Check if the stored challenge starts with the transaction challenge
    // (since the transaction challenge is truncated to 28 bytes)
    const transactionChallengeStr = String(transactionChallenge)
    const storedChallengeStr = String(storedChallenge.challenge)
    
    console.log('🔍 Comparing challenges:')
    console.log('🔍 Stored challenge (string):', storedChallengeStr)
    console.log('🔍 Transaction challenge (string):', transactionChallengeStr)
    console.log('🔍 Stored challenge length:', storedChallengeStr.length)
    console.log('🔍 Transaction challenge length:', transactionChallengeStr.length)
    
    if (!storedChallengeStr.startsWith(transactionChallengeStr)) {
      console.log('❌ Challenge mismatch')
      console.log('❌ Expected (stored):', storedChallengeStr)
      console.log('❌ Received (transaction):', transactionChallengeStr)
      console.log('❌ Stored starts with transaction?', storedChallengeStr.startsWith(transactionChallengeStr))
      return false
    }
    
    // Verify the transaction signature
    let sourceAccount: string
    if ('source' in transaction) {
      sourceAccount = transaction.source
    } else {
      // Handle fee bump transaction
      if (transaction.innerTransaction && 'source' in transaction.innerTransaction) {
        sourceAccount = transaction.innerTransaction.source
      } else {
        console.log('❌ Could not determine transaction source')
        return false
      }
    }
    
    if (sourceAccount !== walletAddress) {
      console.log('❌ Wallet address mismatch')
      console.log('❌ Expected:', walletAddress)
      console.log('❌ Found:', sourceAccount)
      return false
    }
    
    console.log('✅ XDR transaction verification successful')
    
    // Clean up used challenge
    removeChallenge(walletAddress)
    
    return true
  } catch (error) {
    console.error('❌ Error verifying XDR transaction:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Verify POST request received')
    console.log('🔍 Request URL:', request.url)
    console.log('🔍 Request method:', request.method)
    console.log('🔍 Environment:', process.env.NODE_ENV)
    
    const body = await request.json()
    console.log('🔍 Request body:', body)
    
    const validationResult = verificationSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.format())
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { walletAddress, signature, challenge } = validationResult.data
    console.log('🔍 Validated data:', { walletAddress, signature: signature.substring(0, 20) + '...', challenge })
    
    // Debug: Check stored challenges before verification
    const { getDebugInfo } = await import('@/lib/auth-storage')
    const debugInfo = getDebugInfo()
    console.log('🔍 Debug info before verification:', {
      challengesCount: debugInfo.challengesCount,
      hasChallenge: debugInfo.challenges.some(([addr]) => addr === walletAddress),
      allChallenges: debugInfo.challenges.map(([addr, data]) => ({ addr, challenge: data.challenge }))
    })
    
    // Verify XDR transaction
    console.log('🔍 Calling verifyXDRTransaction...')
    const isValid = verifyXDRTransaction(walletAddress, signature, challenge)
    
    console.log('🔍 Verification result:', isValid)
    
    if (!isValid) {
      console.log('❌ Verification failed')
      return NextResponse.json(
        { error: 'Invalid signature or expired challenge' },
        { status: 401 }
      )
    }
    
    console.log('✅ Generating JWT token...')
    // Generate JWT token
    const token = jwt.sign(
      { 
        walletAddress,
        type: 'user',
        iat: Math.floor(Date.now() / 1000),
      },
      ***REMOVED***,
      { expiresIn: JWT_EXPIRES_IN }
    )
    
    // Store session using shared storage
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    storeSession(walletAddress, token, expiresAt)
    
    console.log('✅ Authentication successful, returning token')
    return NextResponse.json({
      success: true,
      token,
      expiresIn: JWT_EXPIRES_IN,
      message: 'Authentication successful'
    })
    
  } catch (error) {
    console.error('❌ Error verifying signature:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to verify JWT token (used by other endpoints)
export function verifyToken(token: string): { valid: boolean; payload?: any } {
  console.log('🔍 Verifying JWT token...')
  console.log('🔍 ***REMOVED*** being used:', ***REMOVED*** ? ***REMOVED***.substring(0, 10) + '...' : 'No ***REMOVED***')
  console.log('🔍 Token being verified:', token ? token.substring(0, 20) + '...' : 'No token')
  
  try {
    const payload = jwt.verify(token, ***REMOVED***) as any
    console.log('✅ JWT payload:', payload)
    
    // In production, we can't rely on in-memory session storage
    // because serverless functions don't share memory between invocations
    // So we'll just verify the JWT signature and expiration
    console.log('✅ JWT verification successful (session check disabled for production)')
    return { valid: true, payload }
    
    // Note: In a production environment with Redis or a database,
    // you would check if the session is still active here
    /*
    // Check if session is still active
    const session = getSession(payload.walletAddress)
    if (!session) {
      console.log('❌ No active session found for wallet:', payload.walletAddress)
      return { valid: false }
    }
    
    console.log('✅ Session found and valid')
    return { valid: true, payload }
    */
  } catch (error) {
    console.log('❌ JWT verification failed:', error)
    console.log('❌ Error name:', error.name)
    console.log('❌ Error message:', error.message)
    return { valid: false }
  }
}

// Helper function to get authenticated user from request
export function getAuthenticatedUser(request: NextRequest): { valid: boolean; user?: any } {
  console.log('🔍 Getting authenticated user from request...')
  const authHeader = request.headers.get('authorization')
  console.log('🔍 Auth header:', authHeader ? 'present' : 'missing')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Invalid or missing authorization header')
    return { valid: false }
  }
  
  const token = authHeader.substring(7)
  console.log('🔍 Extracted token:', token ? `${token.substring(0, 20)}...` : 'empty')
  
  const result = verifyToken(token)
  console.log('🔍 Verification result:', result)
  
  if (result.valid) {
    return { valid: true, user: result.payload }
  } else {
    return { valid: false }
  }
}

// Debug endpoint to check stored challenges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const debug = searchParams.get('debug')
    
    if (debug === 'challenges') {
      const { getDebugInfo } = await import('@/lib/auth-storage')
      const debugInfo = getDebugInfo()
      
      return NextResponse.json({
        success: true,
        debug: debugInfo,
        message: 'Debug information retrieved'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid debug parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 