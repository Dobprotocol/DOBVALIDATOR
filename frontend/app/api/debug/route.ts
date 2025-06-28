import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug endpoint called')
    
    // Test basic Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    console.log('🔍 Supabase connection test:', { testData, testError })
    
    // Check if users table exists and get its structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    console.log('🔍 Users table test:', { users, usersError })
    
    // Check if profiles table exists and get its structure
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    console.log('🔍 Profiles table test:', { profiles, profilesError })
    
    // Get table schema information using information_schema
    const { data: usersSchema, error: usersSchemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' })
    
    const { data: profilesSchema, error: profilesSchemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
    
    // Try to create a test user to see what happens
    const testWalletAddress = 'TEST_WALLET_' + Date.now()
    const { data: testUser, error: testUserError } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
      })
      .select()
      .single()
    
    // Try to create a test profile
    let testProfile = null
    let testProfileError = null
    if (testUser) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: testUser.id,
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
      
      testProfile = profile
      testProfileError = profileError
      
      // Clean up test data
      await supabase.from('profiles').delete().eq('user_id', testUser.id)
      await supabase.from('users').delete().eq('wallet_address', testWalletAddress)
    }
    
    return NextResponse.json({
      success: true,
      supabaseConnection: !testError,
      testError: testError?.message,
      usersTable: {
        exists: !usersError,
        error: usersError?.message,
        sampleData: users?.[0] || null,
        schema: usersSchema || null,
        schemaError: usersSchemaError?.message
      },
      profilesTable: {
        exists: !profilesError,
        error: profilesError?.message,
        sampleData: profiles?.[0] || null,
        schema: profilesSchema || null,
        schemaError: profilesSchemaError?.message
      },
      testUserCreation: {
        success: !testUserError,
        error: testUserError?.message,
        data: testUser
      },
      testProfileCreation: {
        success: !testProfileError,
        error: testProfileError?.message,
        data: testProfile
      }
    })
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error)
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