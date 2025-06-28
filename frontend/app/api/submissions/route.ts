import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { supabaseService } from '@/lib/supabase-service'
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
    
    // Get user by wallet address
    const user = await supabaseService.getUserByWallet(auth.user.walletAddress)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Prepare submission data for Supabase
    const supabaseSubmissionData = {
      user_id: user.id,
      device_name: submissionData.deviceName,
      device_type: submissionData.deviceType,
      serial_number: submissionData.serialNumber,
      manufacturer: submissionData.manufacturer,
      model: submissionData.model,
      year_of_manufacture: submissionData.yearOfManufacture,
      condition: submissionData.condition,
      specifications: submissionData.specifications,
      purchase_price: submissionData.purchasePrice,
      current_value: submissionData.currentValue,
      expected_revenue: submissionData.expectedRevenue,
      operational_costs: submissionData.operationalCosts,
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Create submission in Supabase
    const createdSubmission = await supabaseService.createSubmission(supabaseSubmissionData)
    
    console.log('🔍 Created submission:', createdSubmission)
    
    return NextResponse.json({
      success: true,
      submission: {
        id: createdSubmission.id,
        deviceName: createdSubmission.device_name,
        status: createdSubmission.status,
        submittedAt: createdSubmission.submitted_at
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
    let submissions
    
    if (isAdmin) {
      // Admin: return all submissions
      submissions = await supabaseService.getAllSubmissions({
        status: status || undefined,
        limit,
        offset
      })
    } else {
      // Regular user: only their own submissions
      submissions = await supabaseService.getUserSubmissions(auth.user.walletAddress, {
        status: status || undefined,
        limit,
        offset
      })
    }

    console.log('🔍 Submissions API - User wallet:', auth.user.walletAddress)
    console.log('🔍 Submissions API - Is admin:', isAdmin)
    console.log('🔍 Submissions API - Result:', submissions)

    // Transform data to match expected format
    const transformedSubmissions = submissions.map((sub: any) => ({
      id: sub.id,
      deviceName: sub.device_name,
      deviceType: sub.device_type,
      status: sub.status,
      submittedAt: sub.submitted_at,
      updatedAt: sub.updated_at,
      certificateId: sub.certificate_id
    }))

    return NextResponse.json({
      success: true,
      submissions: transformedSubmissions,
      pagination: {
        total: submissions.length,
        limit,
        offset,
        hasMore: submissions.length === limit
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