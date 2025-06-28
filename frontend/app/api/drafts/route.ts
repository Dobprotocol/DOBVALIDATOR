import { NextRequest, NextResponse } from 'next/server'
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
    const body = await request.json()
    const { 
      id,
      deviceName,
      deviceType,
      location,
      serialNumber,
      manufacturer,
      model,
      yearOfManufacture,
      condition,
      specifications,
      purchasePrice,
      currentValue,
      expectedRevenue,
      operationalCosts,
      walletAddress
    } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await supabaseService.getUserByWallet(walletAddress)
    if (!user) {
      user = await supabaseService.upsertUser({
        wallet_address: walletAddress,
        role: 'OPERATOR'
      })
    }

    // Create or update draft
    const draft = await supabaseService.upsertDraft({
      id: id || undefined,
      device_name: deviceName || '',
      device_type: deviceType || '',
      location: location || '',
      serial_number: serialNumber || '',
      manufacturer: manufacturer || '',
      model: model || '',
      year_of_manufacture: yearOfManufacture || '',
      condition: condition || '',
      specifications: specifications || '',
      purchase_price: purchasePrice || '',
      current_value: currentValue || '',
      expected_revenue: expectedRevenue || '',
      operational_costs: operationalCosts || '',
      user_id: user.id
    })

    return NextResponse.json({ 
      success: true, 
      draft,
      message: 'Draft saved successfully' 
    })
  } catch (error) {
    console.error('Error saving draft:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

// Get user's drafts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get user by wallet address
    const user = await supabaseService.getUserByWallet(walletAddress)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's drafts
    const drafts = await supabaseService.getUserDrafts(user.id)
    
    return NextResponse.json({ drafts })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
} 