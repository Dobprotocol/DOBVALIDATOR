import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Schema debug endpoint called')
    
    // Test 1: Check users table structure
    console.log('🔍 Testing users table...')
    const { data: usersTest, error: usersTestError } = await supabase
      .from('users')
      .select('id, wallet_address, email, name, role, created_at, updated_at')
      .limit(1)
    
    console.log('🔍 Users test result:', { usersTest, usersTestError })
    
    // Test 2: Check profiles table structure
    console.log('🔍 Testing profiles table...')
    const { data: profilesTest, error: profilesTestError } = await supabase
      .from('profiles')
      .select('id, user_id, contact_person, company_name, phone, website, description, industry, address, country, created_at, updated_at')
      .limit(1)
    
    console.log('🔍 Profiles test result:', { profilesTest, profilesTestError })
    
    // Test 3: Try to create a user with our expected schema
    console.log('🔍 Testing user creation...')
    const testWallet = 'TEST_WALLET_' + Date.now()
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert({
        wallet_address: testWallet,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      })
      .select()
      .single()
    
    console.log('🔍 New user result:', { newUser, newUserError })
    
    // Test 4: Try to create a profile with our expected schema
    let newProfile = null
    let newProfileError = null
    if (newUser) {
      console.log('🔍 Testing profile creation...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: newUser.id,
          contact_person: 'Test Contact',
          company_name: 'Test Company',
          phone: '123-456-7890',
          website: 'https://example.com',
          description: 'Test description',
          industry: 'Technology',
          address: 'Test Address',
          country: 'Test Country'
        })
        .select()
        .single()
      
      newProfile = profile
      newProfileError = profileError
      console.log('🔍 New profile result:', { newProfile, newProfileError })
      
      // Clean up
      if (newProfile) {
        await supabase.from('profiles').delete().eq('id', newProfile.id)
      }
      await supabase.from('users').delete().eq('id', newUser.id)
    }
    
    // Test 5: Check what fields actually exist by trying different combinations
    console.log('🔍 Testing field combinations...')
    const { data: fieldTest, error: fieldTestError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0)
    
    console.log('🔍 Field test result:', { fieldTest, fieldTestError })
    
    return NextResponse.json({
      success: true,
      usersTable: {
        selectTest: {
          success: !usersTestError,
          error: usersTestError?.message,
          data: usersTest
        },
        insertTest: {
          success: !newUserError,
          error: newUserError?.message,
          data: newUser
        }
      },
      profilesTable: {
        selectTest: {
          success: !profilesTestError,
          error: profilesTestError?.message,
          data: profilesTest
        },
        insertTest: {
          success: !newProfileError,
          error: newProfileError?.message,
          data: newProfile
        },
        fieldTest: {
          success: !fieldTestError,
          error: fieldTestError?.message
        }
      }
    })
  } catch (error) {
    console.error('❌ Error in schema debug endpoint:', error)
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