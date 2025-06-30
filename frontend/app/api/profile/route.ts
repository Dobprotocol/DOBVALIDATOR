import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { prisma } from '@/lib/prisma'

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
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    
    if (!auth.valid || !auth.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get profile from database
    const profile = await prisma.profile.findUnique({
      where: { userId: auth.user.id },
    })

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
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error in profile GET:', error)
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
    
    if (!auth.valid || !auth.user) {
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
    
    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: auth.user.id },
    })

    let profile
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId: auth.user.id },
        data: {
          name: profileData.name,
          company: profileData.company,
          email: profileData.email,
        },
      })
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: auth.user.id,
          walletAddress: auth.user.walletAddress,
          name: profileData.name,
          company: profileData.company,
          email: profileData.email,
        },
      })
    }

    return NextResponse.json({
      success: true,
      profile: {
        walletAddress: profile.walletAddress,
        name: profile.name,
        company: profile.company,
        email: profile.email,
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
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid || !auth.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Delete profile from database
    await prisma.profile.delete({
      where: { userId: auth.user.id },
    })

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

export async function PATCH(request: NextRequest) {
  return POST(request)
} 