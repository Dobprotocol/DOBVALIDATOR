import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'

// Profile schema validation
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

// Mock profiles storage (in production, use database)
const profiles = new Map<string, any>()

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

    const profile = profiles.get(auth.user.walletAddress)
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

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
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error retrieving profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = profileSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const profileData = validationResult.data
    const walletAddress = auth.user.walletAddress
    
    // Check if profile already exists
    const existingProfile = profiles.get(walletAddress)
    
    const profile = {
      walletAddress,
      ...profileData,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    profiles.set(walletAddress, profile)

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
    const profile = profiles.get(walletAddress)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    profiles.delete(walletAddress)

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