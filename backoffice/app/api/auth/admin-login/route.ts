import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/api-service'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Backoffice admin-login POST request received:', body)
    
    const { walletAddress, signature } = body
    
    if (!walletAddress || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallet address and signature are required'
        },
        { status: 400 }
      )
    }
    
    const result = await apiService.authenticateAdmin(walletAddress, signature)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('❌ Error in admin login:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 