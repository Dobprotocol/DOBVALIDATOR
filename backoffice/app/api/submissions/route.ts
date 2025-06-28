import { NextRequest, NextResponse } from 'next/server'
import { backofficeSupabaseService } from '@/lib/supabase-service'
import { adminConfigService } from '@/lib/admin-config'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Backoffice submissions GET request received')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    console.log('🔍 Query params:', { status, limit, offset })
    
    // For now, we'll return all submissions without authentication check
    // In production, you'd want to verify admin authentication here
    const submissions = await backofficeSupabaseService.getAllSubmissionsWithUsers({
      status: status || undefined,
      limit,
      offset
    })
    
    console.log('🔍 Found submissions:', submissions.length)
    
    return NextResponse.json({
      success: true,
      submissions: submissions.map(submission => ({
        id: submission.id,
        deviceName: submission.device_name,
        deviceType: submission.device_type,
        customDeviceType: submission.custom_device_type,
        location: submission.location,
        serialNumber: submission.serial_number,
        manufacturer: submission.manufacturer,
        model: submission.model,
        yearOfManufacture: submission.year_of_manufacture,
        condition: submission.condition,
        specifications: submission.specifications,
        purchasePrice: submission.purchase_price,
        currentValue: submission.current_value,
        expectedRevenue: submission.expected_revenue,
        operationalCosts: submission.operational_costs,
        status: submission.status,
        submittedAt: submission.submitted_at,
        updatedAt: submission.updated_at,
        userId: submission.user_id,
        user: submission.user ? {
          id: submission.user.id,
          walletAddress: submission.user.wallet_address,
          name: submission.user.name,
          email: submission.user.email,
          role: submission.user.role
        } : null
      })),
      total: submissions.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('❌ Error in backoffice submissions GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 