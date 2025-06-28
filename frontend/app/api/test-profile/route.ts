import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabase-service'
import { supabase } from '@/lib/supabase'

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

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Test Profile POST request received')
    
    // Check for test API key in headers
    const testKey = request.headers.get('x-test-key')
    if (testKey !== 'test-123') {
      return NextResponse.json(
        { error: 'Test API key required' },
        { status: 401 }
      )
    }
    
    // Use a test wallet address
    const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
    
    const body = await request.json()
    console.log('🔍 Test Profile POST body:', body)
    
    const validationResult = profileSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.log('❌ Profile validation failed:', validationResult.error.format())
      return NextResponse.json(
        { error: 'Invalid profile data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const profileData = validationResult.data
    console.log('🔍 Creating profile for test wallet:', walletAddress)
    
    // Test Supabase connection first
    console.log('🔍 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError)
      return NextResponse.json(
        { error: 'Database connection failed', details: testError.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Supabase connection successful')
    
    // Try to get existing user first
    console.log('🔍 Checking for existing user...')
    let user = await supabaseService.getUserByWallet(walletAddress)
    
    if (!user) {
      console.log('🔍 User not found, creating user directly...')
      
      // Try to create user directly with minimal data first
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          email: profileData.email,
          name: profileData.name
          // Don't specify role - let it use default
        })
        .select()
        .single()
      
      if (userError) {
        console.error('❌ Failed to create user:', userError)
        return NextResponse.json(
          { error: 'Failed to create user account', details: userError.message },
          { status: 500 }
        )
      }
      
      user = newUser
      console.log('✅ User created successfully:', user)
    } else {
      console.log('🔍 Existing user found:', user)
    }
    
    // Check if profile already exists
    console.log('🔍 Checking for existing profile...')
    const existingProfile = await supabaseService.getProfileByUserId(user.id)
    console.log('🔍 Existing profile check:', existingProfile ? 'found' : 'not found')
    
    // Prepare profile data for Supabase
    const supabaseProfileData = {
      user_id: user.id,
      contact_person: profileData.name,
      company_name: profileData.company || null,
      phone: profileData.phone || null,
      website: profileData.website || null,
      description: profileData.bio || null,
      industry: null,
      address: null,
      country: null,
      updated_at: new Date().toISOString()
    }

    console.log('🔍 Profile data to store:', supabaseProfileData)

    // Create or update profile in Supabase
    console.log('🔍 Upserting profile...')
    const profile = await supabaseService.upsertProfile(supabaseProfileData)
    console.log('🔍 Profile stored successfully:', profile)

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
    console.error('❌ Error creating/updating test profile:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 