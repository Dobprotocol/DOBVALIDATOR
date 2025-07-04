import { NextRequest, NextResponse } from 'next/server'
import { adminConfigService } from '@/lib/admin-config'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, challenge, signature } = await request.json()

    if (!walletAddress || !challenge || !signature) {
      return NextResponse.json(
        { error: 'Wallet address, challenge, and signature are required' },
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

    // For demo purposes, we'll accept any signature that starts with "mock_signature_"
    // In production, this would verify the actual signature
    if (!signature.startsWith('mock_signature_')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Generate a simple token
    const token = `admin_token_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const expiresIn = 3600 // 1 hour

    return NextResponse.json({
      token,
      expiresIn,
      walletAddress,
      role: adminWallet.role,
      permissions: adminWallet.permissions
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 