import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { verifyChallenge } from '../challenge/route'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

// Verification schema validation
const verificationSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  signature: z.string().min(1, "Signature is required"),
  challenge: z.string().min(1, "Challenge is required"),
})

// JWT secret (in production, use environment variable)
const ***REMOVED*** = process.env.***REMOVED*** || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // 7 days

// Store active sessions (in production, use Redis or database)
const activeSessions = new Map<string, { token: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Verify POST request received')
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
    
    // Verify the challenge and signature
    console.log('🔍 Calling verifyChallenge...')
    const isValid = verifyChallenge(walletAddress, signature, challenge)
    console.log('🔍 Challenge verification result:', isValid)
    
    if (!isValid) {
      console.log('❌ Challenge verification failed')
      return NextResponse.json(
        { error: 'Invalid signature or expired challenge' },
        { status: 401 }
      )
    }
    
    // For development: accept mock signatures
    // In production, implement proper cryptographic verification
    const isMockSignature = signature.startsWith('mock_signature_')
    console.log('🔍 Is mock signature:', isMockSignature)
    
    if (!isMockSignature) {
      // TODO: Implement proper signature verification using Stellar SDK
      // const isValidSignature = verifyStellarSignature(walletAddress, signature, challenge)
      // if (!isValidSignature) {
      //   return NextResponse.json(
      //     { error: 'Invalid cryptographic signature' },
      //     { status: 401 }
      //   )
      // }
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
    
    // Store session
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    activeSessions.set(walletAddress, { token, expiresAt })
    
    // Clean up expired sessions
    const now = Date.now()
    for (const [addr, session] of activeSessions.entries()) {
      if (now > session.expiresAt) {
        activeSessions.delete(addr)
      }
    }
    
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
  try {
    console.log('🔍 Verifying JWT token...')
    const payload = jwt.verify(token, ***REMOVED***) as any
    console.log('✅ JWT payload:', payload)
    
    // Check if session is still active
    const session = activeSessions.get(payload.walletAddress)
    console.log('🔍 Session lookup:', session ? 'found' : 'not found')
    
    // In development, be more lenient - just check if JWT is valid
    // In production, you should always verify the session
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Development mode: JWT verification successful')
      return { valid: true, payload }
    }
    
    // Production mode: strict session validation
    if (!session || session.token !== token) {
      console.log('❌ Session invalid or token mismatch')
      return { valid: false }
    }
    
    console.log('✅ JWT verification successful')
    return { valid: true, payload }
  } catch (error) {
    console.error('❌ JWT verification failed:', error)
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
  
  return result
} 