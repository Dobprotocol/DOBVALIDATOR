import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/api-service'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Backoffice submission GET request received for ID:', params.id)
    
    const submission = await apiService.getSubmissionById(params.id)
    
    return NextResponse.json({
      success: true,
      data: submission
    })
    
  } catch (error) {
    console.error('❌ Error fetching submission:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log('🔍 Backoffice submission PATCH request received for ID:', params.id, 'Body:', body)
    
    const { status } = body
    
    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status is required'
        },
        { status: 400 }
      )
    }
    
    const updatedSubmission = await apiService.updateSubmissionStatus(params.id, status)
    
    return NextResponse.json({
      success: true,
      data: updatedSubmission
    })
    
  } catch (error) {
    console.error('❌ Error updating submission:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 