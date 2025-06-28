import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { submissionStorage } from '@/lib/submission-storage'

// Draft schema (very flexible for partial data - drafts are works in progress)
const draftSchema = z.object({
  name: z.string().optional(),
  deviceName: z.string().optional(),
  deviceType: z.string().optional(),
  customDeviceType: z.string().optional(),
  location: z.string().optional(),
  yearOfManufacture: z.string().optional(),
  condition: z.string().optional(),
  specifications: z.string().optional(),
  purchasePrice: z.string().optional(),
  currentValue: z.string().optional(),
  expectedRevenue: z.string().optional(),
  operationalCosts: z.string().optional(),
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
      console.error('Draft validation failed:', validationResult.error.format())
      return NextResponse.json(
        { error: 'Invalid draft data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data
    
    if (draftId) {
      // Update existing draft
      console.log('🔍 Updating existing draft:', draftId)
      const existingDraft = submissionStorage.get(draftId)
      if (!existingDraft) {
        console.log('🔍 Draft not found:', draftId)
        return NextResponse.json(
          { error: 'Draft not found' },
          { status: 404 }
        )
      }

      if (existingDraft.operatorWallet !== auth.user.walletAddress) {
        console.log('🔍 Unauthorized access to draft:', draftId)
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      if (existingDraft.status !== 'draft') {
        console.log('🔍 Can only update draft submissions:', existingDraft.status)
        return NextResponse.json(
          { error: 'Can only update draft submissions' },
          { status: 400 }
        )
      }

      const updatedDraft = submissionStorage.update(draftId, {
        name: validatedData.name || '',
        deviceName: validatedData.deviceName || '',
        deviceType: validatedData.deviceType || '',
        customDeviceType: validatedData.customDeviceType || '',
        location: validatedData.location || '',
        serialNumber: validatedData.serialNumber || '',
        manufacturer: validatedData.manufacturer || '',
        model: validatedData.model || '',
        yearOfManufacture: validatedData.yearOfManufacture || '',
        condition: validatedData.condition || '',
        specifications: validatedData.specifications || '',
        purchasePrice: validatedData.purchasePrice || '',
        currentValue: validatedData.currentValue || '',
        expectedRevenue: validatedData.expectedRevenue || '',
        operationalCosts: validatedData.operationalCosts || '',
        files: (validatedData.files?.filter(file => file.filename && file.path && file.documentType) || []) as Array<{
          filename: string
          path: string
          documentType: string
        }>,
        updatedAt: new Date().toISOString()
      })

      console.log('🔍 Draft updated successfully:', updatedDraft?.id)

      return NextResponse.json({
        success: true,
        draft: {
          id: updatedDraft!.id,
          name: updatedDraft!.name,
          deviceName: updatedDraft!.deviceName,
          status: updatedDraft!.status,
          updatedAt: updatedDraft!.updatedAt
        },
        message: 'Draft updated successfully'
      })
    } else {
      // Create new draft
      console.log('🔍 Creating new draft')
      const draftId = `DRAFT_${Date.now()}_${Math.random().toString(36).substring(2)}`
      console.log('🔍 Generated draft ID:', draftId)
      
      const draft = {
        id: draftId,
        name: validatedData.name || '',
        deviceName: validatedData.deviceName || '',
        deviceType: validatedData.deviceType || '',
        customDeviceType: validatedData.customDeviceType || '',
        location: validatedData.location || '',
        serialNumber: validatedData.serialNumber || '',
        manufacturer: validatedData.manufacturer || '',
        model: validatedData.model || '',
        yearOfManufacture: validatedData.yearOfManufacture || '',
        condition: validatedData.condition || '',
        specifications: validatedData.specifications || '',
        purchasePrice: validatedData.purchasePrice || '',
        currentValue: validatedData.currentValue || '',
        expectedRevenue: validatedData.expectedRevenue || '',
        operationalCosts: validatedData.operationalCosts || '',
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
          name: createdDraft.name,
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
        name: draft.name,
        deviceName: draft.deviceName,
        deviceType: draft.deviceType,
        customDeviceType: draft.customDeviceType,
        location: draft.location,
        serialNumber: draft.serialNumber,
        manufacturer: draft.manufacturer,
        model: draft.model,
        yearOfManufacture: draft.yearOfManufacture,
        condition: draft.condition,
        specifications: draft.specifications,
        purchasePrice: draft.purchasePrice,
        currentValue: draft.currentValue,
        expectedRevenue: draft.expectedRevenue,
        operationalCosts: draft.operationalCosts,
        files: draft.files,
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