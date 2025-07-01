import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/api-service'
import { adminConfigService } from '@/lib/admin-config'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Backoffice submissions GET request received')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    console.log('🔍 Query params:', { status, limit, offset })
    
    // For now, we'll return all submissions without authentication check
    // In production, you'd want to verify admin authentication here
    const submissions = await apiService.getAllSubmissions({
      status: status || undefined,
      limit,
      offset
    })
    
    console.log('🔍 Found submissions:', submissions.length)
    
    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        total: submissions.length,
        limit,
        offset,
        hasMore: submissions.length === limit
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching submissions:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: []
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Backoffice submissions POST request received:', body)
    
    // Handle different types of POST requests
    if (body.action === 'updateStatus') {
      const { submissionId, status } = body
      const updatedSubmission = await apiService.updateSubmissionStatus(submissionId, status)
      
      return NextResponse.json({
        success: true,
        data: updatedSubmission
      })
    }
    
    if (body.action === 'createReview') {
      const reviewData = {
        submission_id: body.submissionId,
        notes: body.notes,
        technical_score: body.technicalScore,
        regulatory_score: body.regulatoryScore,
        financial_score: body.financialScore,
        environmental_score: body.environmentalScore,
        overall_score: body.overallScore,
        decision: body.decision
      }
      
      const review = await apiService.upsertAdminReview(reviewData)
      
      return NextResponse.json({
        success: true,
        data: review
      })
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action specified'
      },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('❌ Error in submissions POST:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 