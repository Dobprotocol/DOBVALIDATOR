import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'

// Draft schema (very flexible for partial data - drafts are works in progress)
const draftSchema = z.object({
  deviceName: z.string().optional(),
  deviceType: z.string().optional(),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  yearOfManufacture: z.string().optional(),
  condition: z.string().optional(),
  specifications: z.string().optional(),
  purchasePrice: z.string().optional(),
  currentValue: z.string().optional(),
  expectedRevenue: z.string().optional(),
  operationalCosts: z.string().optional(),
})

// Create or update a draft
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Draft POST request received')
    
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    console.log('🔍 Auth result:', { valid: auth.valid, user: auth.user })
    
    if (!auth.valid) {
      console.log('❌ Authentication failed')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('🔍 Request body:', body)
    const { draftId, ...draftData } = body

    // Validate draft data
    const validationResult = draftSchema.safeParse(draftData)
    if (!validationResult.success) {
      console.error('❌ Draft validation failed:', validationResult.error.format())
      return NextResponse.json(
        { error: 'Invalid draft data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data
    console.log('🔍 Validated data:', validatedData)
    
    // Forward to backend database
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const authToken = request.headers.get('authorization')
    console.log('🔍 Backend URL:', backendUrl)
    console.log('🔍 Auth token present:', !!authToken)
    
    if (draftId) {
      // Update existing draft
      console.log('🔍 Updating existing draft:', draftId)
      
      const updateResponse = await fetch(`${backendUrl}/api/drafts/${draftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken || ''
        },
        body: JSON.stringify(validatedData)
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        return NextResponse.json(
          { error: errorData.error || 'Failed to update draft' },
          { status: updateResponse.status }
        )
      }

      const updatedDraft = await updateResponse.json()
      console.log('🔍 Draft updated successfully:', updatedDraft.draft?.id)

      return NextResponse.json({
        success: true,
        draft: {
          id: updatedDraft.draft.id,
          name: updatedDraft.draft.deviceName ? `${updatedDraft.draft.deviceName} - ${updatedDraft.draft.deviceType || 'Device'}` : 'Untitled Draft',
          deviceName: updatedDraft.draft.deviceName,
          status: 'draft',
          updatedAt: updatedDraft.draft.updatedAt
        },
        message: 'Draft updated successfully'
      })
    } else {
      // Create new draft
      console.log('🔍 Creating new draft')
      
      const createResponse = await fetch(`${backendUrl}/api/drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken || ''
        },
        body: JSON.stringify(validatedData)
      })

      console.log('🔍 Backend response status:', createResponse.status)
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        console.error('❌ Backend error:', errorData)
        return NextResponse.json(
          { error: errorData.error || 'Failed to create draft' },
          { status: createResponse.status }
        )
      }

      const createdDraft = await createResponse.json()
      console.log('🔍 Draft created successfully:', createdDraft.draft?.id)

      return NextResponse.json({
        success: true,
        draft: {
          id: createdDraft.draft.id,
          name: createdDraft.draft.deviceName ? `${createdDraft.draft.deviceName} - ${createdDraft.draft.deviceType || 'Device'}` : 'Untitled Draft',
          deviceName: createdDraft.draft.deviceName,
          status: 'draft',
          submittedAt: createdDraft.draft.createdAt
        },
        message: 'Draft created successfully'
      })
    }

  } catch (error) {
    console.error('Error managing draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get user's drafts
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    const offset = searchParams.get('offset') || '0'
    
    // Forward to backend database
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const authToken = request.headers.get('authorization')
    
    const response = await fetch(`${backendUrl}/api/drafts?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': authToken || ''
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch drafts' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('🔍 Backend drafts data:', data)
    
    // Add status field to drafts since backend doesn't have it
    const draftsWithStatus = (data.drafts || []).map((draft: any) => ({
      ...draft,
      status: 'draft'
    }))
    
    console.log('🔍 Drafts with status:', draftsWithStatus)
    
    return NextResponse.json({
      success: true,
      drafts: draftsWithStatus,
      total: data.total || 0,
      hasMore: data.hasMore || false
    })

  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 