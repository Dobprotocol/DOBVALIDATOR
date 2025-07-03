import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../auth/verify/route'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test auth GET request received')
    
    // Test authentication
    const auth = getAuthenticatedUser(request)
    console.log('🔍 Auth result:', { valid: auth.valid, user: auth.user })
    
    if (!auth.valid) {
      console.log('❌ Authentication failed')
      return NextResponse.json(
        { 
          error: 'Authentication required',
          details: 'JWT verification failed',
          authResult: auth
        },
        { status: 401 }
      )
    }

    console.log('✅ Authentication successful')
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: auth.user
    })
    
  } catch (error) {
    console.error('❌ Error in test auth:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
} 