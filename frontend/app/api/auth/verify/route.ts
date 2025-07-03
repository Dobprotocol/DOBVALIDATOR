import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSafeBackendUrl } from '@/lib/api-utils'
import { storeSession } from '@/lib/auth-storage'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

// Verification schema validation
const verificationSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  signature: z.string().min(1, "Signature (XDR transaction) is required"),
  challenge: z.string().min(1, "Challenge is required"),
})

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
    
    console.log('✅ Calling backend for verification and JWT...')
    
    // Get the backend URL safely
    const backendUrl = getSafeBackendUrl()
    const backendResponse = await fetch(`${backendUrl}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress,
        signature,
        challenge
      })
    })
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('❌ Backend verification failed:', backendResponse.status, errorText)
      return NextResponse.json(
        { error: 'Backend verification failed' },
        { status: backendResponse.status }
      )
    }
    
    const backendData = await backendResponse.json()
    console.log('✅ Backend verification successful:', backendData)
    
    // Store session using shared storage
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    storeSession(walletAddress, backendData.token, expiresAt)
    
    console.log('✅ Authentication successful, returning backend token')
    return NextResponse.json({
      success: true,
      token: backendData.token,
      expiresIn: backendData.expiresIn,
      user: backendData.user,
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