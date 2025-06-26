import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { storeChallenge } from '@/lib/auth-storage'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

// Challenge schema validation
const challengeSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Challenge POST request received')
    
    // Check if request has body
    if (!request.body) {
      console.error('❌ No request body found')
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    console.log('🔍 Challenge request body:', body)
    
    const validationResult = challengeSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.log('❌ Challenge validation failed:', validationResult.error.format())
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { walletAddress } = validationResult.data
    console.log('🔍 Generating challenge for wallet:', walletAddress)
    
    // Generate a unique challenge
    const challenge = `DOB_VALIDATOR_AUTH_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    // Store challenge using shared storage
    try {
      storeChallenge(walletAddress, challenge)
    } catch (storageError) {
      console.error('❌ Failed to store challenge:', storageError)
      return NextResponse.json(
        { error: 'Failed to store challenge' },
        { status: 500 }
      )
    }
    
    console.log('✅ Challenge generated successfully')
    return NextResponse.json({
      success: true,
      challenge,
      message: 'Please sign this challenge with your wallet to authenticate'
    })
    
  } catch (error) {
    console.error('❌ Error generating challenge:', error)
    
    // Provide more specific error information
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Internal server error', message: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 