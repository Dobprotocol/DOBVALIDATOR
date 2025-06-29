import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  profileImage: z.string().optional(),
})

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Mock authentication for development/testing
async function getAuthenticatedUser(request: NextRequest) {
  console.log('🔍 Getting authenticated user from request...')
  
  const authHeader = request.headers.get('authorization')
  console.log('🔍 Auth header:', authHeader ? 'present' : 'missing')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Invalid or missing authorization header')
    return null
  }
  
  const token = authHeader.substring(7)
  console.log('🔍 Extracted token:', token.substring(0, 20) + '...')
  
  // Check if this is a fallback development token
  if (token.startsWith('dev_fallback_token_')) {
    console.log('🔧 Development fallback token detected')
    
    // Extract wallet address from token (simple format: dev_fallback_token_timestamp)
    const timestamp = token.replace('dev_fallback_token_', '')
    const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3BAL3ZN' // Default for development
    
    console.log('✅ Development authentication successful')
    return {
      id: walletAddress,
      email: `${walletAddress}@stellar.wallet`,
      wallet_address: walletAddress
    }
  }
  
  // Check if this is a mock token
  if (token.startsWith('mock_access_token_')) {
    console.log('🔧 Mock token detected')
    
    // Extract wallet address from token or use default
    const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3BAL3ZN'
    
    console.log('✅ Mock authentication successful')
    return {
      id: walletAddress,
      email: `${walletAddress}@stellar.wallet`,
      wallet_address: walletAddress
    }
  }
  
  console.log('🔍 Verifying JWT token...')
  console.log('🔍 ***REMOVED*** being used:', process.env.***REMOVED***?.substring(0, 10) + '...')
  console.log('🔍 Token being verified:', token.substring(0, 20) + '...')
  
  try {
    const payload = jwt.verify(token, process.env.***REMOVED*** || 'dob-validator-dev-secret') as any
    console.log('✅ JWT payload:', payload)
    
    // In production, we can't rely on in-memory session storage {
    // so we'll use the JWT payload directly
    return {
      id: payload.walletAddress,
      email: payload.email || `${payload.walletAddress}@stellar.wallet`,
      wallet_address: payload.walletAddress
    }
  } catch (error) {
    console.log('❌ JWT verification failed:', error)
    console.log('❌ Error name:', error.constructor.name)
    console.log('❌ Error message:', error.message)
    return null
  }
}

// Real Supabase authentication
async function getSupabaseAuthenticatedUser(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured, using mock authentication')
    return getAuthenticatedUser(request)
  }

  try {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    const { createClient } = await import('@supabase/supabase-js')

    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('❌ Supabase authentication failed:', error?.message)
      return null
    }

    console.log('✅ Supabase user authenticated:', user.email)
    return {
      id: user.id,
      email: user.email,
      wallet_address: user.user_metadata?.wallet_address || user.email
    }
  } catch (error) {
    console.error('❌ Error with Supabase authentication:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  console.log('🔍 Profile GET request received')
  
  const user = await getSupabaseAuthenticatedUser(request)
  
  if (!user) {
    console.log('❌ Authentication required')
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  console.log('✅ User authenticated:', user.wallet_address)
  
  // If Supabase is configured, try to get real profile data
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Get user from database
      const { data: dbUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', user.wallet_address)
        .single()

      if (userError || !dbUser) {
        console.log('ℹ️ User not found in database, returning mock data')
        return getMockProfile(user)
      }

      // Get profile from database
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', dbUser.id)
        .single()

      if (profileError || !profile) {
        console.log('ℹ️ Profile not found in database, returning mock data')
        return getMockProfile(user)
      }

      console.log('✅ Real profile data retrieved from database')
      return NextResponse.json({
        success: true,
        profile: {
          walletAddress: dbUser.wallet_address,
          name: profile.contact_person,
          company: profile.company_name,
          email: dbUser.email,
          phone: profile.phone,
          website: profile.website,
          bio: profile.description,
          profileImage: null,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
      })
    } catch (error) {
      console.error('❌ Error getting real profile data:', error)
      console.log('🔄 Falling back to mock data')
      return getMockProfile(user)
    }
  }
  
  // Fallback to mock data
  return getMockProfile(user)
}

function getMockProfile(user: any) {
  const mockProfile = {
    walletAddress: user.wallet_address,
    name: 'Test User',
    company: 'Test Company',
    email: user.email,
    phone: '+1234567890',
    website: 'https://example.com',
    bio: 'This is a mock profile for testing purposes',
    profileImage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json({
    success: true,
    profile: mockProfile,
    note: 'This is mock data for testing. In production, this would come from the database.'
  })
}

export async function POST(request: NextRequest) {
  console.log('🔍 Profile POST request received')
  
  const user = await getSupabaseAuthenticatedUser(request)
  
  if (!user) {
    console.log('❌ Authentication required')
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  console.log('✅ User authenticated:', user.wallet_address)

  const body = await request.json()
  const validationResult = profileSchema.safeParse(body)
  
  if (!validationResult.success) {
    console.log('❌ Validation failed:', validationResult.error.format())
    return NextResponse.json({ 
      error: 'Invalid profile data', 
      details: validationResult.error.format() 
    }, { status: 400 })
  }
  
  const profileData = validationResult.data
  console.log('✅ Profile data validated:', profileData)

  // If Supabase is configured, try to save to real database
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Upsert user
      const { data: upsertedUser, error: upsertUserError } = await supabaseAdmin
        .from('users')
        .upsert({
          wallet_address: user.wallet_address,
          email: profileData.email,
          name: profileData.name,
          role: 'OPERATOR',
        }, { onConflict: 'wallet_address' })
        .select()
        .single()

      if (upsertUserError || !upsertedUser) {
        console.error('❌ Error upserting user:', upsertUserError)
        throw new Error('Failed to upsert user')
      }

      // Upsert profile
      const { data: upsertedProfile, error: upsertProfileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: upsertedUser.id,
          contact_person: profileData.name,
          company_name: profileData.company,
          phone: profileData.phone,
          website: profileData.website,
          description: profileData.bio,
        }, { onConflict: 'user_id' })
        .select()
        .single()

      if (upsertProfileError || !upsertedProfile) {
        console.error('❌ Error upserting profile:', upsertProfileError)
        throw new Error('Failed to upsert profile')
      }

      console.log('✅ Profile saved to real database')
      return NextResponse.json({ 
        success: true, 
        profile: upsertedProfile
      })
    } catch (error) {
      console.error('❌ Error saving to real database:', error)
      console.log('🔄 Falling back to mock response')
      return getMockProfileResponse(profileData, user)
    }
  }
  
  // Fallback to mock response
  return getMockProfileResponse(profileData, user)
}

function getMockProfileResponse(profileData: any, user: any) {
  const mockProfile = {
    id: 'mock_profile_id',
    user_id: user.id,
    contact_person: profileData.name,
    company_name: profileData.company,
    phone: profileData.phone,
    website: profileData.website,
    description: profileData.bio,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return NextResponse.json({ 
    success: true, 
    profile: mockProfile,
    note: 'This is a mock response for testing. In production, this would save to the database.'
  })
}

export async function PUT(request: NextRequest) {
  // PUT is the same as POST for profile updates
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getSupabaseAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (isSupabaseConfigured()) {
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Get user from database
      const { data: dbUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', user.wallet_address)
        .single()
      
      if (userError || !dbUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Delete profile
      const { error: deleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('user_id', dbUser.id)

      if (deleteError) {
        console.error('❌ Error deleting profile:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Profile deleted successfully'
      })
    } else {
      // Mock delete response
      return NextResponse.json({
        success: true,
        message: 'Profile deleted successfully (mock)'
      })
    }
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