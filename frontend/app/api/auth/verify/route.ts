import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { verifyChallenge } from '../challenge/route'

// Verification schema validation
const verificationSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  signature: z.string().min(1, "Signature is required"),
  challenge: z.string().min(1, "Challenge is required"),
})

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // 7 days

// Store active sessions (in production, use Redis or database)
const activeSessions = new Map<string, { token: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = verificationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { walletAddress, signature, challenge } = validationResult.data
    
    // Verify the challenge and signature
    const isValid = verifyChallenge(walletAddress, signature, challenge)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature or expired challenge' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        walletAddress,
        type: 'user',
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
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
    
    return NextResponse.json({
      success: true,
      token,
      expiresIn: JWT_EXPIRES_IN,
      message: 'Authentication successful'
    })
    
  } catch (error) {
    console.error('Error verifying signature:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to verify JWT token (used by other endpoints)
export function verifyToken(token: string): { valid: boolean; payload?: any } {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    
    // Check if session is still active
    const session = activeSessions.get(payload.walletAddress)
    if (!session || session.token !== token) {
      return { valid: false }
    }
    
    return { valid: true, payload }
  } catch (error) {
    return { valid: false }
  }
}

// Helper function to get authenticated user from request
export function getAuthenticatedUser(request: NextRequest): { valid: boolean; user?: any } {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false }
  }
  
  const token = authHeader.substring(7)
  return verifyToken(token)
} 