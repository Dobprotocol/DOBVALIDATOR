import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../auth/verify/route'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test DB endpoint called')
    
    // Test 1: Check authentication
    const auth = getAuthenticatedUser(request)
    console.log('🔍 Auth test:', { valid: auth.valid, user: auth.user })
    
    if (!auth.valid) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        step: 'auth'
      })
    }
    
    // Test 2: Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', auth.user.walletAddress)
      .single()
    
    console.log('🔍 User lookup test:', { existingUser, userError })
    
    // Test 3: Try to create a user if it doesn't exist
    let user = existingUser
    if (!existingUser) {
      console.log('🔍 Creating test user...')
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: auth.user.walletAddress,
          email: 'test@example.com',
          name: 'Test User'
        })
        .select()
        .single()
      
      console.log('🔍 User creation test:', { newUser, createError })
      
      if (newUser) {
        user = newUser
        
        // Clean up test user
        await supabase.from('users').delete().eq('id', newUser.id)
      }
    }
    
    // Test 4: Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    console.log('🔍 Profiles table test:', { profiles, profilesError })
    
    // Test 5: Try to create a profile
    if (user) {
      console.log('🔍 Creating test profile...')
      
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          contact_person: 'Test Contact',
          company_name: 'Test Company',
          phone: '123-456-7890',
          website: 'https://example.com',
          description: 'Test description'
        })
        .select()
        .single()
      
      console.log('🔍 Profile creation test:', { newProfile, profileError })
      
      // Clean up test profile
      if (newProfile) {
        await supabase.from('profiles').delete().eq('id', newProfile.id)
      }
    }
    
    return NextResponse.json({
      success: true,
      auth: {
        valid: auth.valid,
        walletAddress: auth.user.walletAddress
      },
      userLookup: {
        success: !userError,
        error: userError?.message,
        data: existingUser
      },
      userCreation: {
        success: !!user,
        data: user
      },
      profilesTable: {
        success: !profilesError,
        error: profilesError?.message,
        data: profiles
      },
      profileCreation: {
        success: !!user,
        data: user ? 'Test completed' : 'No user to test with'
      }
    })
    
  } catch (error) {
    console.error('❌ Error in test DB endpoint:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
} 