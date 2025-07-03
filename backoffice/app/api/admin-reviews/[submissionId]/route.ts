import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/api-service'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    console.log('🔍 Backoffice admin-review GET request received for submission ID:', params.submissionId)
    
    const review = await apiService.getAdminReview(params.submissionId)
    
    return NextResponse.json({
      success: true,
      data: review
    })
    
  } catch (error) {
    console.error('❌ Error fetching admin review:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 