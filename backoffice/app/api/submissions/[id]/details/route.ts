import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/api-service'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Backoffice submission details GET request received for ID:', params.id)
    
    const submission = await apiService.getSubmissionWithDetails(params.id)
    
    return NextResponse.json({
      success: true,
      data: submission
    })
    
  } catch (error) {
    console.error('❌ Error fetching submission details:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 