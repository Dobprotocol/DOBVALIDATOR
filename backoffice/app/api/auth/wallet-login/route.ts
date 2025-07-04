import { NextRequest, NextResponse } from 'next/server'
import { adminConfigService } from '@/lib/admin-config'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, challenge } = await request.json()

    if (!walletAddress || !signature || !challenge) {
      return NextResponse.json(
        { error: 'Wallet address, signature, and challenge are required' },
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

    // For demo purposes, we'll accept any valid XDR signature
    // In production, this would verify the actual XDR signature against the challenge
    if (!signature.startsWith('AAAA') || signature.length < 100) {
      return NextResponse.json(
        { error: 'Invalid signature format' },
        { status: 401 }
      )
    }

    // Log the signature for debugging
    console.log('🔍 Verifying signature for wallet:', walletAddress)
    console.log('🔍 Challenge:', challenge)
    console.log('🔍 Signature length:', signature.length)
    console.log('🔍 Signature starts with AAAA:', signature.startsWith('AAAA'))

    // Generate a JWT token (in production, use a proper JWT library)
    const token = `admin_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const expiresIn = 3600 // 1 hour
    const expiresAt = Date.now() + (expiresIn * 1000)

    // Create auth token data
    const authTokenData = {
      token,
      expiresIn,
      walletAddress,
      role: adminWallet.role,
      permissions: adminWallet.permissions,
      expiresAt
    }

    return NextResponse.json({
      success: true,
      access_token: token,
      refresh_token: `refresh_${Date.now()}`,
      user: {
        id: `admin_${walletAddress}`,
        wallet_address: walletAddress,
        role: adminWallet.role,
        permissions: adminWallet.permissions
      },
      session: {
        access_token: token,
        refresh_token: `refresh_${Date.now()}`,
        expires_in: expiresIn,
        expires_at: expiresAt
      }
    })
  } catch (error) {
    console.error('Wallet login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 