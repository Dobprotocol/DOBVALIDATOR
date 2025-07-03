import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/api-service'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Backoffice admin-reviews POST request received:', body)
    
    const review = await apiService.upsertAdminReview(body)
    
    return NextResponse.json({
      success: true,
      data: review
    })
    
  } catch (error) {
    console.error('❌ Error creating admin review:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 