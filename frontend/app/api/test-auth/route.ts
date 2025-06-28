import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../auth/verify/route'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test auth endpoint called')
    
    const auth = getAuthenticatedUser(request)
    console.log('🔍 Auth result:', auth)
    
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required', step: 'auth' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        walletAddress: auth.user.walletAddress,
        type: auth.user.type,
        iat: auth.user.iat
      }
    })
  } catch (error) {
    console.error('❌ Error in test auth endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
} 