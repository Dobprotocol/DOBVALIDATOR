import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/api-service'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Backoffice profile GET request received')
    
    const profile = await apiService.getAdminProfile()
    
    return NextResponse.json({
      success: true,
      data: profile
    })
    
  } catch (error) {
    console.error('❌ Error fetching admin profile:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 