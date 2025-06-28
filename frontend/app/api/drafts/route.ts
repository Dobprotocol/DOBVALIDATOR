import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { supabaseService } from '@/lib/supabase-service'

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
    
    // Get user by wallet address
    const user = await supabaseService.getUserByWallet(auth.user.walletAddress)
    if (!user) {
      console.log('❌ User not found for wallet:', auth.user.walletAddress)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Prepare draft data for Supabase
    const supabaseDraftData = {
      id: draftId || undefined,
      user_id: user.id,
      device_name: validatedData.deviceName || '',
      device_type: validatedData.deviceType || '',
      location: validatedData.location || '',
      serial_number: validatedData.serialNumber || '',
      manufacturer: validatedData.manufacturer || '',
      model: validatedData.model || '',
      year_of_manufacture: validatedData.yearOfManufacture || '',
      condition: validatedData.condition || '',
      specifications: validatedData.specifications || '',
      purchase_price: validatedData.purchasePrice || '',
      current_value: validatedData.currentValue || '',
      expected_revenue: validatedData.expectedRevenue || '',
      operational_costs: validatedData.operationalCosts || '',
      updated_at: new Date().toISOString()
    }

    if (draftId) {
      // Update existing draft
      console.log('🔍 Updating existing draft:', draftId)
      
      const updatedDraft = await supabaseService.upsertDraft(supabaseDraftData)
      console.log('🔍 Draft updated successfully:', updatedDraft.id)

      return NextResponse.json({
        success: true,
        draft: {
          id: updatedDraft.id,
          name: updatedDraft.device_name ? `${updatedDraft.device_name} - ${updatedDraft.device_type || 'Device'}` : 'Untitled Draft',
          deviceName: updatedDraft.device_name,
          status: 'draft',
          updatedAt: updatedDraft.updated_at
        },
        message: 'Draft updated successfully'
      })
    } else {
      // Create new draft
      console.log('🔍 Creating new draft')
      
      const createdDraft = await supabaseService.upsertDraft(supabaseDraftData)
      console.log('🔍 Draft created successfully:', createdDraft.id)

      return NextResponse.json({
        success: true,
        draft: {
          id: createdDraft.id,
          name: createdDraft.device_name ? `${createdDraft.device_name} - ${createdDraft.device_type || 'Device'}` : 'Untitled Draft',
          deviceName: createdDraft.device_name,
          status: 'draft',
          submittedAt: createdDraft.created_at
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
    
    // Get user's drafts from Supabase
    const drafts = await supabaseService.getUserDrafts(auth.user.walletAddress, {
      limit,
      offset
    })
    
    console.log('🔍 Supabase drafts data:', drafts)
    
    // Transform data to match expected format
    const draftsWithStatus = drafts.map((draft: any) => ({
      id: draft.id,
      deviceName: draft.device_name,
      deviceType: draft.device_type,
      location: draft.location,
      serialNumber: draft.serial_number,
      manufacturer: draft.manufacturer,
      model: draft.model,
      yearOfManufacture: draft.year_of_manufacture,
      condition: draft.condition,
      specifications: draft.specifications,
      purchasePrice: draft.purchase_price,
      currentValue: draft.current_value,
      expectedRevenue: draft.expected_revenue,
      operationalCosts: draft.operational_costs,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
      status: 'draft'
    }))
    
    console.log('🔍 Drafts with status:', draftsWithStatus)
    
    return NextResponse.json({
      success: true,
      drafts: draftsWithStatus,
      total: drafts.length,
      hasMore: drafts.length === limit
    })

  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 