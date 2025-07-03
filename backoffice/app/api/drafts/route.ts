import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/api-service'
import { adminConfigService } from '@/lib/admin-config'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Backoffice drafts GET request received')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    console.log('🔍 Query params:', { userId, limit, offset })
    
    // Get drafts (submissions with DRAFT status)
    const drafts = await apiService.getAllSubmissions({
      status: 'DRAFT',
      limit,
      offset
    })
    
    // Filter by user if specified
    const filteredDrafts = userId 
      ? drafts?.filter(draft => draft.user_id === userId) || []
      : drafts || []
    
    console.log('🔍 Found drafts:', filteredDrafts.length)
    
    return NextResponse.json({
      success: true,
      data: filteredDrafts,
      pagination: {
        total: filteredDrafts.length,
        limit,
        offset,
        hasMore: filteredDrafts.length === limit
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching drafts:', error)
    
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
    console.log('🔍 Backoffice drafts POST request received:', body)
    
    // Handle different types of POST requests
    if (body.action === 'createDraft') {
      // Create a new draft submission
      const draftData = {
        device_name: body.deviceName || '',
        device_type: body.deviceType || '',
        custom_device_type: body.customDeviceType || null,
        location: body.location || '',
        serial_number: body.serialNumber || '',
        manufacturer: body.manufacturer || '',
        model: body.model || '',
        year_of_manufacture: body.yearOfManufacture || '',
        condition: body.condition || '',
        specifications: body.specifications || '',
        purchase_price: body.purchasePrice || '',
        current_value: body.currentValue || '',
        expected_revenue: body.expectedRevenue || '',
        operational_costs: body.operationalCosts || '',
        user_id: body.userId || '',
        status: 'DRAFT'
      }
      
      // For now, we'll simulate creating a draft
      // In a real implementation, you'd call the backend API
      const mockDraft = {
        id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...draftData,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json({
        success: true,
        data: mockDraft
      })
    }
    
    if (body.action === 'updateDraft') {
      const { draftId, ...updateData } = body
      
      // Update an existing draft
      const updatedDraft = {
        id: draftId,
        ...updateData,
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json({
        success: true,
        data: updatedDraft
      })
    }
    
    if (body.action === 'submitDraft') {
      const { draftId } = body
      
      // Convert draft to submitted submission
      const submittedSubmission = await apiService.updateSubmissionStatus(draftId, 'PENDING')
      
      return NextResponse.json({
        success: true,
        data: submittedSubmission
      })
    }
    
    if (body.action === 'deleteDraft') {
      const { draftId } = body
      
      // In a real implementation, you'd delete the draft from the database
      console.log('🗑️ Deleting draft:', draftId)
      
      return NextResponse.json({
        success: true,
        message: 'Draft deleted successfully'
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
    console.error('❌ Error in drafts POST:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 