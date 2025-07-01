import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Profile schema validation
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
})

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

    // Get profile from database
    const profile = await prisma.profile.findUnique({
      where: { walletAddress: auth.user.walletAddress },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile retrieved successfully'
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
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { name, email, company } = validationResult.data

    // Get or create user
    const user = await prisma.user.upsert({
      where: { walletAddress: auth.user.walletAddress },
      update: {
        email: email || null,
        name: name || null,
        company: company || null,
      } satisfies Prisma.UserUpdateInput,
      create: {
        walletAddress: auth.user.walletAddress,
        email: email || null,
        name: name || null,
        company: company || null,
        role: 'OPERATOR',
      } satisfies Prisma.UserCreateInput,
    })

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { walletAddress: auth.user.walletAddress },
      update: {
        name,
        email,
        company: company || null,
      } satisfies Prisma.ProfileUpdateInput,
      create: {
        walletAddress: auth.user.walletAddress,
        name,
        email,
        company: company || null,
        user: {
          connect: {
            id: user.id
          }
        },
      } satisfies Prisma.ProfileCreateInput,
    })

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating profile:', error)
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
      where: { walletAddress: auth.user.walletAddress },
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