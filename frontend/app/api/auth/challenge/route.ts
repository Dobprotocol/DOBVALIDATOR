import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { storeChallenge, getDebugInfo } from '@/lib/auth-storage'
import { getSafeBackendUrl } from '@/lib/api-utils'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

// Challenge schema validation
const challengeSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Challenge POST request received')
    console.log('🔍 Request URL:', request.url)
    console.log('🔍 Environment:', process.env.NODE_ENV)
    
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
    console.log('🔍 Getting challenge from backend for wallet:', walletAddress)
    
    // Get the backend URL safely
    const backendUrl = getSafeBackendUrl()
    const backendResponse = await fetch(`${backendUrl}/api/auth/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress
      })
    })
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('❌ Backend challenge request failed:', backendResponse.status, errorText)
      return NextResponse.json(
        { error: 'Backend challenge request failed' },
        { status: backendResponse.status }
      )
    }
    
    const backendData = await backendResponse.json()
    console.log('✅ Backend challenge received:', backendData)
    
    // Store challenge locally for frontend verification
    try {
      storeChallenge(walletAddress, backendData.challenge)
      console.log('✅ Challenge stored locally for frontend verification')
    } catch (storageError) {
      console.error('❌ Failed to store challenge locally:', storageError)
      // Don't fail the request, just log the error
    }
    
    console.log('✅ Challenge received from backend and stored locally')
    return NextResponse.json({
      success: true,
      challenge: backendData.challenge,
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

// Debug endpoint to check stored challenges
export async function GET(request: NextRequest) {
  try {
    const debugInfo = getDebugInfo()
    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Debug information retrieved'
    })
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 