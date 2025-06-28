import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../auth/verify/route'
import { supabaseService } from '@/lib/supabase-service'

// Get draft by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    console.log('🔍 Getting draft by ID:', id)

    // Get draft from Supabase
    const draft = await supabaseService.getDraftById(id)
    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Verify the draft belongs to the authenticated user
    const user = await supabaseService.getUserByWallet(auth.user.walletAddress)
    if (!user || draft.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Transform data to match expected format
    const transformedDraft = {
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
    }

    return NextResponse.json({
      success: true,
      draft: transformedDraft
    })

  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update draft by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    console.log('🔍 Updating draft by ID:', id)

    // Get user by wallet address
    const user = await supabaseService.getUserByWallet(auth.user.walletAddress)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify the draft belongs to the authenticated user
    const existingDraft = await supabaseService.getDraftById(id)
    if (!existingDraft || existingDraft.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Prepare draft data for Supabase
    const supabaseDraftData = {
      id,
      user_id: user.id,
      device_name: body.deviceName || existingDraft.device_name,
      device_type: body.deviceType || existingDraft.device_type,
      location: body.location || existingDraft.location,
      serial_number: body.serialNumber || existingDraft.serial_number,
      manufacturer: body.manufacturer || existingDraft.manufacturer,
      model: body.model || existingDraft.model,
      year_of_manufacture: body.yearOfManufacture || existingDraft.year_of_manufacture,
      condition: body.condition || existingDraft.condition,
      specifications: body.specifications || existingDraft.specifications,
      purchase_price: body.purchasePrice || existingDraft.purchase_price,
      current_value: body.currentValue || existingDraft.current_value,
      expected_revenue: body.expectedRevenue || existingDraft.expected_revenue,
      operational_costs: body.operationalCosts || existingDraft.operational_costs,
      updated_at: new Date().toISOString()
    }

    // Update draft in Supabase
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

  } catch (error) {
    console.error('Error updating draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete draft by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    console.log('🔍 Deleting draft by ID:', id)

    // Get user by wallet address
    const user = await supabaseService.getUserByWallet(auth.user.walletAddress)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify the draft belongs to the authenticated user
    const existingDraft = await supabaseService.getDraftById(id)
    if (!existingDraft || existingDraft.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete draft from Supabase
    await supabaseService.deleteDraft(id)
    console.log('🔍 Draft deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 