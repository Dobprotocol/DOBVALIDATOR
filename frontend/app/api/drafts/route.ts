import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { submissionStorage } from '@/lib/submission-storage'

// Draft schema (same as submission but with draft status)
const draftSchema = z.object({
  deviceName: z.string().min(1, "Device name is required"),
  deviceType: z.string().min(1, "Device type is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  yearOfManufacture: z.string().min(4, "Year must be 4 digits"),
  condition: z.string().min(1, "Condition is required"),
  specifications: z.string().min(10, "Specifications must be at least 10 characters"),
  purchasePrice: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Purchase price must be greater than 0"
  }),
  currentValue: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Current value must be greater than or equal to 0"
  }),
  expectedRevenue: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Expected revenue must be greater than or equal to 0"
  }),
  operationalCosts: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Operational costs must be greater than or equal to 0"
  }),
  files: z.array(z.object({
    filename: z.string(),
    path: z.string(),
    documentType: z.string()
  })).optional(),
})

// Create or update a draft
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { draftId, ...draftData } = body

    // Validate draft data
    const validationResult = draftSchema.safeParse(draftData)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid draft data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data
    
    if (draftId) {
      // Update existing draft
      const existingDraft = submissionStorage.get(draftId)
      if (!existingDraft) {
        return NextResponse.json(
          { error: 'Draft not found' },
          { status: 404 }
        )
      }

      if (existingDraft.operatorWallet !== auth.user.walletAddress) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      if (existingDraft.status !== 'draft') {
        return NextResponse.json(
          { error: 'Can only update draft submissions' },
          { status: 400 }
        )
      }

      const updatedDraft = submissionStorage.update(draftId, {
        ...validatedData,
        files: (validatedData.files?.filter(file => file.filename && file.path && file.documentType) || []) as Array<{
          filename: string
          path: string
          documentType: string
        }>,
        updatedAt: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        draft: {
          id: updatedDraft!.id,
          deviceName: updatedDraft!.deviceName,
          status: updatedDraft!.status,
          updatedAt: updatedDraft!.updatedAt
        },
        message: 'Draft updated successfully'
      })
    } else {
      // Create new draft
      const draftId = `DRAFT_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      const draft = {
        id: draftId,
        deviceName: validatedData.deviceName,
        deviceType: validatedData.deviceType,
        serialNumber: validatedData.serialNumber,
        manufacturer: validatedData.manufacturer,
        model: validatedData.model,
        yearOfManufacture: validatedData.yearOfManufacture,
        condition: validatedData.condition,
        specifications: validatedData.specifications,
        purchasePrice: validatedData.purchasePrice,
        currentValue: validatedData.currentValue,
        expectedRevenue: validatedData.expectedRevenue,
        operationalCosts: validatedData.operationalCosts,
        operatorWallet: auth.user.walletAddress,
        status: 'draft' as const,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: (validatedData.files?.filter(file => file.filename && file.path && file.documentType) || []) as Array<{
          filename: string
          path: string
          documentType: string
        }>,
        // Admin fields (not applicable for drafts)
        adminNotes: null,
        adminScore: null,
        adminDecision: null,
        adminDecisionAt: null,
        certificateId: null,
      }

      const createdDraft = submissionStorage.create(draft)

      return NextResponse.json({
        success: true,
        draft: {
          id: createdDraft.id,
          deviceName: createdDraft.deviceName,
          status: createdDraft.status,
          submittedAt: createdDraft.submittedAt
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get drafts using shared storage
    const result = submissionStorage.getPaginated({
      walletAddress: auth.user.walletAddress,
      status: 'draft',
      limit,
      offset
    })
    
    return NextResponse.json({
      success: true,
      drafts: result.submissions.map(draft => ({
        id: draft.id,
        deviceName: draft.deviceName,
        deviceType: draft.deviceType,
        status: draft.status,
        submittedAt: draft.submittedAt,
        updatedAt: draft.updatedAt
      })),
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: result.hasMore
      }
    })
    
  } catch (error) {
    console.error('Error retrieving drafts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 