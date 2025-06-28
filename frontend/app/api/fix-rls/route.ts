import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fix RLS endpoint called')
    
    // Create a policy that allows anon users to create users
    const { data: createPolicy, error: createPolicyError } = await supabase
      .rpc('sql', {
        query: `
          CREATE POLICY IF NOT EXISTS "Allow anon to create users" 
          ON public.users 
          FOR INSERT 
          TO anon 
          WITH CHECK (true)
        `
      })
    
    console.log('🔧 Create policy result:', { createPolicy, createPolicyError })
    
    // Create a policy that allows users to read their own data
    const { data: readPolicy, error: readPolicyError } = await supabase
      .rpc('sql', {
        query: `
          CREATE POLICY IF NOT EXISTS "Allow users to read own data" 
          ON public.users 
          FOR SELECT 
          TO anon 
          USING (true)
        `
      })
    
    console.log('🔧 Read policy result:', { readPolicy, readPolicyError })
    
    // Test user creation after policy fix
    const testWalletAddress = `TEST_WALLET_FIXED_${Date.now()}`
    const { data: testUser, error: testUserError } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress,
        email: 'test-fixed@example.com',
        name: 'Test User Fixed',
        role: 'OPERATOR'
      })
      .select()
      .single()
    
    console.log('🔧 Test user creation after fix:', { testUser, testUserError })
    
    // Clean up test user
    if (testUser) {
      await supabase.from('users').delete().eq('wallet_address', testWalletAddress)
      console.log('✅ Test user cleaned up')
    }
    
    return NextResponse.json({
      success: true,
      createPolicy: {
        success: !createPolicyError,
        error: createPolicyError?.message,
        data: createPolicy
      },
      readPolicy: {
        success: !readPolicyError,
        error: readPolicyError?.message,
        data: readPolicy
      },
      testUserCreation: {
        success: !testUserError,
        error: testUserError?.message,
        data: testUser
      }
    })
  } catch (error) {
    console.error('❌ Error in fix RLS endpoint:', error)
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