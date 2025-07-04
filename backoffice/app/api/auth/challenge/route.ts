import { NextRequest, NextResponse } from 'next/server'
import { adminConfigService } from '@/lib/admin-config'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Check if the wallet is an admin (or if we're in MVP mode)
    const adminWallet = adminConfigService.getAdminWallet(walletAddress)
    if (!adminWallet) {
      return NextResponse.json(
        { error: 'Unauthorized: Wallet is not an admin' },
        { status: 403 }
      )
    }

    // Generate a simple challenge
    const challenge = `admin_challenge_${Date.now()}_${Math.random().toString(36).substring(7)}`

    return NextResponse.json({ 
      challenge,
      walletAddress,
      role: adminWallet.role,
      permissions: adminWallet.permissions
    })
  } catch (error) {
    console.error('Challenge generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 