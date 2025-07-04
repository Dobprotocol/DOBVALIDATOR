import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug simple endpoint called')
    
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    })
  } catch (error) {
    console.error('❌ Error in debug simple endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
} 