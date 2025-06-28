import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { submissionStorage } from '@/lib/submission-storage'
import { adminConfigService } from '@/lib/admin-config'
import { supabaseService } from '@/lib/supabase-service'

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
    const body = await request.json()
    const { 
      deviceName,
      deviceType,
      customDeviceType,
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

    // Create submission
    const submission = await supabaseService.createSubmission({
      device_name: deviceName,
      device_type: deviceType,
      custom_device_type: customDeviceType || null,
      location,
      serial_number: serialNumber,
      manufacturer,
      model,
      year_of_manufacture: yearOfManufacture,
      condition,
      specifications,
      purchase_price: purchasePrice,
      current_value: currentValue,
      expected_revenue: expectedRevenue,
      operational_costs: operationalCosts,
      user_id: user.id,
      status: 'PENDING'
    })

    return NextResponse.json({ 
      success: true, 
      submission,
      message: 'Submission created successfully' 
    })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}

// Get user's submissions or all if admin
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

    // Get user's submissions
    const submissions = await supabaseService.getUserSubmissions(user.id)
    
    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
} 