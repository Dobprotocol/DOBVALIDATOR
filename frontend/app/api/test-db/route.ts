import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test DB endpoint called')
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
      supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'N/A',
      supabaseKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...' || 'N/A'
    }
    
    console.log('🔍 Environment check:', envCheck)
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    console.log('🔍 Connection test:', { connectionTest, connectionError })
    
    // Try to create a test user with detailed error logging
    const testWalletAddress = `TEST_WALLET_${Date.now()}`
    console.log('🔍 Attempting to create test user with wallet:', testWalletAddress)
    
    const { data: testUser, error: testUserError } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress,
        email: 'test@example.com',
        name: 'Test User',
        role: 'OPERATOR'
      })
      .select()
      .single()
    
    console.log('🔍 Test user creation result:', { testUser, testUserError })
    
    if (testUserError) {
      console.error('❌ Test user creation failed:')
      console.error('❌ Error code:', testUserError.code)
      console.error('❌ Error message:', testUserError.message)
      console.error('❌ Error details:', testUserError.details)
      console.error('❌ Error hint:', testUserError.hint)
    }
    
    // Clean up test user if created
    if (testUser) {
      await supabase.from('users').delete().eq('wallet_address', testWalletAddress)
      console.log('✅ Test user cleaned up')
    }
    
    // Check RLS policies
    const { data: rlsInfo, error: rlsError } = await supabase
      .rpc('get_rls_policies', { table_name: 'users' })
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      connection: {
        success: !connectionError,
        error: connectionError?.message,
        data: connectionTest
      },
      testUserCreation: {
        success: !testUserError,
        error: testUserError ? {
          code: testUserError.code,
          message: testUserError.message,
          details: testUserError.details,
          hint: testUserError.hint
        } : null,
        data: testUser
      },
      rlsPolicies: {
        success: !rlsError,
        error: rlsError?.message,
        data: rlsInfo
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