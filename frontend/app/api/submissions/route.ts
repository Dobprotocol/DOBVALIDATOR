import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { submissionStorage } from '@/lib/submission-storage'
import { adminConfigService } from '@/lib/admin-config'

// Submission schema
const submissionSchema = z.object({
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

// Mock submissions storage (in production, use database)
// const submissions = new Map<string, any>() // Removed - now using shared storage

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
    const validationResult = submissionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const submissionData = validationResult.data
    
    // Generate unique submission ID
    const submissionId = `SUB_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    // Create submission record
    const submission = {
      id: submissionId,
      deviceName: submissionData.deviceName,
      deviceType: submissionData.deviceType,
      serialNumber: submissionData.serialNumber,
      manufacturer: submissionData.manufacturer,
      model: submissionData.model,
      yearOfManufacture: submissionData.yearOfManufacture,
      condition: submissionData.condition,
      specifications: submissionData.specifications,
      purchasePrice: submissionData.purchasePrice,
      currentValue: submissionData.currentValue,
      expectedRevenue: submissionData.expectedRevenue,
      operationalCosts: submissionData.operationalCosts,
      operatorWallet: auth.user.walletAddress,
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [],
      // Admin fields (only for admin users)
      adminNotes: null,
      adminScore: null,
      adminDecision: null,
      adminDecisionAt: null,
      certificateId: null,
    }
    
    // Store submission using shared storage
    const createdSubmission = submissionStorage.create(submission)
    
    console.log('🔍 Created submission:', createdSubmission)
    console.log('🔍 All submissions after creation:', Array.from(submissionStorage.getAll()))
    
    return NextResponse.json({
      success: true,
      submission: {
        id: createdSubmission.id,
        deviceName: createdSubmission.deviceName,
        status: createdSubmission.status,
        submittedAt: createdSubmission.submittedAt
      },
      message: 'Submission created successfully'
    })
    
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get user's submissions or all if admin
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if user is admin
    const isAdmin = adminConfigService.isAdminWallet(auth.user.walletAddress)
    let result
    if (isAdmin) {
      // Admin: return all submissions (optionally filtered), excluding drafts
      result = submissionStorage.getPaginated({
        status: status || undefined,
        limit,
        offset,
        excludeDrafts: false // Temporarily show all items
      })
    } else {
      // Regular user: only their own submissions, excluding drafts
      result = submissionStorage.getPaginated({
        walletAddress: auth.user.walletAddress,
        status: status || undefined,
        limit,
        offset,
        excludeDrafts: false // Temporarily show all items
      })
    }

    console.log('🔍 Submissions API - User wallet:', auth.user.walletAddress)
    console.log('🔍 Submissions API - Is admin:', isAdmin)
    console.log('🔍 Submissions API - All storage items:', Array.from(submissionStorage.getAll()))
    console.log('🔍 Submissions API - Filtered result:', result)

    return NextResponse.json({
      success: true,
      submissions: result.submissions.map(sub => ({
        id: sub.id,
        deviceName: sub.deviceName,
        deviceType: sub.deviceType,
        status: sub.status,
        submittedAt: sub.submittedAt,
        updatedAt: sub.updatedAt,
        certificateId: sub.certificateId
      })),
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: result.hasMore
      }
    })
  } catch (error) {
    console.error('Error retrieving submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 