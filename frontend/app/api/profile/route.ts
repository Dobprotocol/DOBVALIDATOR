import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../auth/verify/route'
import { supabaseService } from '@/lib/supabase-service'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

// Profile schema validation - updated to match actual database schema
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
    
    // First get the user by wallet address
    const user = await supabaseService.getUserByWallet(auth.user.walletAddress)
    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Then get the profile by user_id
    const profile = await supabaseService.getProfileByUserId(user.id)
    console.log('🔍 Profile lookup result:', profile ? 'found' : 'not found')
    if (profile) {
      console.log('🔍 Profile details:', { contact_person: profile.contact_person, company_name: profile.company_name })
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
        walletAddress: auth.user.walletAddress,
        name: profile.contact_person,
        company: profile.company_name,
        email: user.email,
        phone: profile.phone,
        website: profile.website,
        bio: profile.description,
        profileImage: null, // Not in current schema
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
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
    
    // Test Supabase connection first with detailed error logging
    console.log('🔍 Testing Supabase connection...')
    console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing')
    console.log('🔍 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing')
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('❌ Supabase connection failed:', testError)
        console.error('❌ Error code:', testError.code)
        console.error('❌ Error message:', testError.message)
        console.error('❌ Error details:', testError.details)
        return NextResponse.json(
          { error: 'Database connection failed', details: testError.message },
          { status: 500 }
        )
      }
      
      console.log('✅ Supabase connection successful')
    } catch (connectionError) {
      console.error('❌ Supabase connection exception:', connectionError)
      return NextResponse.json(
        { error: 'Database connection exception', details: connectionError.message },
        { status: 500 }
      )
    }
    
    // Try to get existing user first
    console.log('🔍 Checking for existing user...')
    let user
    try {
      user = await supabaseService.getUserByWallet(walletAddress)
      console.log('🔍 User lookup result:', user ? 'found' : 'not found')
    } catch (userError) {
      console.error('❌ Error getting user by wallet:', userError)
      return NextResponse.json(
        { error: 'Failed to check existing user', details: userError.message },
        { status: 500 }
      )
    }
    
    if (!user) {
      console.log('🔍 User not found, creating user directly...')
      
      try {
        // Try to create user directly with minimal data first
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            email: profileData.email,
            name: profileData.name,
            role: 'OPERATOR' // Use OPERATOR as default role
          })
          .select()
          .single()
        
        if (userError) {
          console.error('❌ Failed to create user:', userError)
          console.error('❌ Error code:', userError.code)
          console.error('❌ Error message:', userError.message)
          console.error('❌ Error details:', userError.details)
          return NextResponse.json(
            { error: 'Failed to create user account', details: userError.message },
            { status: 500 }
          )
        }
        
        user = newUser
        console.log('✅ User created successfully:', user)
      } catch (createUserError) {
        console.error('❌ Exception creating user:', createUserError)
        return NextResponse.json(
          { error: 'Exception creating user', details: createUserError.message },
          { status: 500 }
        )
      }
    } else {
      console.log('🔍 Existing user found:', user)
    }
    
    // Check if profile already exists
    console.log('🔍 Checking for existing profile...')
    let existingProfile
    try {
      existingProfile = await supabaseService.getProfileByUserId(user.id)
      console.log('🔍 Existing profile check:', existingProfile ? 'found' : 'not found')
    } catch (profileError) {
      console.error('❌ Error checking existing profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to check existing profile', details: profileError.message },
        { status: 500 }
      )
    }
    
    // Prepare profile data for Supabase - updated to match actual schema
    const supabaseProfileData = {
      user_id: user.id,
      contact_person: profileData.name,
      company_name: profileData.company || null,
      phone: profileData.phone || null,
      website: profileData.website || null,
      description: profileData.bio || null,
      industry: null, // Not provided in form
      address: null, // Not provided in form
      country: null, // Not provided in form
      updated_at: new Date().toISOString()
    }

    console.log('🔍 Profile data to store:', supabaseProfileData)

    // Create or update profile in Supabase
    console.log('🔍 Upserting profile...')
    let profile
    try {
      profile = await supabaseService.upsertProfile(supabaseProfileData)
      console.log('🔍 Profile stored successfully:', profile)
    } catch (upsertError) {
      console.error('❌ Error upserting profile:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save profile', details: upsertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        walletAddress: walletAddress,
        name: profile.contact_person,
        company: profile.company_name,
        email: user.email,
        phone: profile.phone,
        website: profile.website,
        bio: profile.description,
        profileImage: null,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully'
    })
  } catch (error) {
    console.error('❌ Error creating/updating profile:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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
    const user = await supabaseService.getUserByWallet(walletAddress)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const profile = await supabaseService.getProfileByUserId(user.id)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    await supabaseService.deleteProfile(user.id)

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
  // PATCH is the same as POST for profile updates
  return POST(request)
} 