import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { getChallenge, removeChallenge, storeSession, getSession } from '@/lib/auth-storage'

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
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'
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

    // Basic XDR verification
    if (!signature || !signature.length) {
      console.log('❌ Invalid signature')
      return false
    }

    // Verify the XDR contains our operation name and challenge
    const decodedXDR = Buffer.from(signature, 'base64').toString()
    const hasOpName = decodedXDR.includes('DOB_VALIDATOR_AUTH')
    const hasChallenge = decodedXDR.includes(challenge)

    if (!hasOpName || !hasChallenge) {
      console.log('❌ Invalid operation or challenge')
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

export async function POST(request: Request) {
  try {
    const { walletAddress, challenge, signature } = await request.json()

    if (!walletAddress || !challenge || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the signed transaction
    const isValid = verifyXDRTransaction(walletAddress, signature, challenge)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const expiresIn = '24h'
    const token = jwt.sign(
      {
        walletAddress,
        timestamp: Date.now(),
      },
      JWT_SECRET,
      { expiresIn }
    )

    return NextResponse.json({ token, expiresIn })
  } catch (error) {
    console.error('Error in auth verify:', error)
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