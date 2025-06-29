import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { storeProfile, getProfile, updateProfile, removeProfile } from '../../../lib/auth-storage'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

// Profile schema validation
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  profileImage: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile GET request received')
    
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

    console.log('✅ Authentication successful, checking profile for wallet:', auth.user.walletAddress)
    
    // Debug: Check what's in the profiles storage
    const { getDebugInfo } = await import('../../../lib/auth-storage')
    const debugInfo = getDebugInfo()
    console.log('🔍 Debug info for profile lookup:', {
      profilesCount: debugInfo.profilesCount,
      hasProfile: debugInfo.profiles.some(([addr]) => addr === auth.user.walletAddress),
      allProfiles: debugInfo.profiles.map(([addr, data]) => ({ addr, name: data.name }))
    })
    
    const profile = getProfile(auth.user.walletAddress)
    console.log('🔍 Profile lookup result:', profile ? 'found' : 'not found')
    if (profile) {
      console.log('🔍 Profile details:', { name: profile.name, company: profile.company, email: profile.email })
    }
    
    if (!profile) {
      console.log('❌ Profile not found, returning 404')
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('✅ Profile found, returning data')
    return NextResponse.json({
      success: true,
      profile: {
        walletAddress: profile.walletAddress,
        name: profile.name,
        company: profile.company,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        bio: profile.bio,
        profileImage: profile.profileImage,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    })
  } catch (error) {
    console.error('❌ Error in profile GET:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Profile POST request received')
    
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    console.log('🔍 Auth result:', { valid: auth.valid, user: auth.user })
    
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('🔍 Profile POST body:', body)
    
    const validationResult = profileSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.log('❌ Profile validation failed:', validationResult.error.format())
      return NextResponse.json(
        { error: 'Invalid profile data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const profileData = validationResult.data
    const walletAddress = auth.user.walletAddress
    console.log('🔍 Creating profile for wallet:', walletAddress)
    
    // Check if profile already exists
    const existingProfile = getProfile(walletAddress)
    console.log('🔍 Existing profile check:', existingProfile ? 'found' : 'not found')
    
    const profile = {
      walletAddress,
      ...profileData,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('🔍 Profile data to store:', profile)

    if (existingProfile) {
      console.log('🔍 Updating existing profile')
      updateProfile(walletAddress, profileData)
    } else {
      console.log('🔍 Creating new profile')
      storeProfile(walletAddress, profileData)
    }

    // Verify the profile was stored correctly
    const storedProfile = getProfile(walletAddress)
    console.log('🔍 Verification - stored profile:', storedProfile ? 'found' : 'not found')

    return NextResponse.json({
      success: true,
      profile: {
        walletAddress: profile.walletAddress,
        name: profile.name,
        company: profile.company,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        bio: profile.bio,
        profileImage: profile.profileImage,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully'
    })
  } catch (error) {
    console.error('Error creating/updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  // PUT is the same as POST for profile updates
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const walletAddress = auth.user.walletAddress
    const profile = getProfile(walletAddress)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    removeProfile(walletAddress)

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Debug endpoint to check stored profiles
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, walletAddress } = body
    
    if (action === 'debug') {
      const { getDebugInfo } = await import('../../../lib/auth-storage')
      const debugInfo = getDebugInfo()
      
      return NextResponse.json({
        success: true,
        debug: debugInfo,
        message: 'Debug information retrieved'
      })
    }
    
    if (action === 'logout' && walletAddress) {
      const { removeProfile } = await import('../../../lib/auth-storage')
      removeProfile(walletAddress)
      console.log('🚪 Profile cleared for logout:', walletAddress)
      return NextResponse.json({
        success: true,
        message: 'Profile cleared for logout'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ Error in profile PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 