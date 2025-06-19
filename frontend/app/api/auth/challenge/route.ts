import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Challenge schema validation
const challengeSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
})

// Store challenges temporarily (in production, use Redis or database)
const challenges = new Map<string, { challenge: string; timestamp: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = challengeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { walletAddress } = validationResult.data
    
    // Generate a unique challenge
    const challenge = `DOB_VALIDATOR_AUTH_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const timestamp = Date.now()
    
    // Store challenge with 5-minute expiration
    challenges.set(walletAddress, { challenge, timestamp })
    
    // Clean up expired challenges
    const now = Date.now()
    for (const [addr, data] of challenges.entries()) {
      if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
        challenges.delete(addr)
      }
    }
    
    return NextResponse.json({
      success: true,
      challenge,
      message: 'Please sign this challenge with your wallet to authenticate'
    })
    
  } catch (error) {
    console.error('Error generating challenge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to verify challenge (used by other endpoints)
export function verifyChallenge(walletAddress: string, signature: string, challenge: string): boolean {
  console.log('🔍 Verifying challenge...')
  console.log('🔍 Wallet address:', walletAddress)
  console.log('🔍 Challenge:', challenge)
  console.log('🔍 Signature:', signature)
  
  const storedChallenge = challenges.get(walletAddress)
  console.log('🔍 Stored challenge:', storedChallenge)
  
  if (!storedChallenge) {
    console.log('❌ No stored challenge found for wallet')
    return false
  }
  
  // Check if challenge is expired (5 minutes)
  if (Date.now() - storedChallenge.timestamp > 5 * 60 * 1000) {
    console.log('❌ Challenge expired')
    challenges.delete(walletAddress)
    return false
  }
  
  // Check if challenge matches
  if (storedChallenge.challenge !== challenge) {
    console.log('❌ Challenge mismatch')
    console.log('❌ Expected:', storedChallenge.challenge)
    console.log('❌ Received:', challenge)
    return false
  }
  
  console.log('✅ Challenge verification successful')
  
  // TODO: Verify signature cryptographically using Stellar SDK
  // For now, we'll accept any signature for the correct challenge
  // In production, implement proper signature verification
  
  // Clean up used challenge
  challenges.delete(walletAddress)
  
  return true
} 