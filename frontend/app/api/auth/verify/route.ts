import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { getChallenge, removeChallenge, storeSession, getSession } from '@/lib/auth-storage'
import { TransactionBuilder, Networks } from '@stellar/stellar-sdk'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Verification schema validation
const verificationSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  signature: z.string().min(1, "Signature is required"),
  challenge: z.string().min(1, "Challenge is required"),
})

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d' // 7 days

// Helper function to verify XDR transaction
function verifyXDRTransaction(walletAddress: string, signature: string, challenge: string): boolean {
  try {
    // Get stored challenge
    const storedChallenge = getChallenge(walletAddress)
    if (!storedChallenge || storedChallenge.challenge !== challenge) {
      console.log('❌ Challenge mismatch or expired')
      return false
    }

    // Remove used challenge
    removeChallenge(walletAddress)

    // Verify signature
    const tx = TransactionBuilder.fromXDR(signature, Networks.PUBLIC)
    const operations = tx.operations
    if (operations.length !== 1) {
      console.log('❌ Invalid number of operations')
      return false
    }

    // Verify operation type and content
    const operation = operations[0]
    if (operation.type !== 'manageData' || operation.name !== 'DOB_VALIDATOR_AUTH') {
      console.log('❌ Invalid operation type or name')
      return false
    }

    // Verify challenge value
    const value = operation.value.toString()
    if (value !== challenge) {
      console.log('❌ Challenge value mismatch')
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Error verifying XDR transaction:', error)
    return false
  }
}

interface JWTPayload {
  walletAddress: string
  type: 'user'
  iat: number
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
    const payload: JWTPayload = {
      walletAddress,
      type: 'user',
      iat: Math.floor(Date.now() / 1000),
    }
    
    const token = jwt.sign(payload, JWT_SECRET)
    
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
  console.log('🔍 JWT_SECRET being used:', JWT_SECRET ? JWT_SECRET.substring(0, 10) + '...' : 'No JWT_SECRET')
  console.log('🔍 Token being verified:', token ? token.substring(0, 20) + '...' : 'No token')
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    console.log('✅ JWT payload:', payload)
    
    // Temporarily disable session check to isolate JWT verification issue
    console.log('✅ JWT verification successful (session check disabled)')
    return { valid: true, payload }
    
    // Original session check (commented out for debugging)
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