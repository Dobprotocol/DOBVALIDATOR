import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug RLS endpoint called')
    
    // Check if RLS is enabled on users table
    const { data: rlsEnabled, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
    
    console.log('🔍 RLS enabled check:', { rlsEnabled, rlsError })
    
    // Try to get RLS policies using raw SQL
    const { data: policies, error: policiesError } = await supabase
      .rpc('sql', { 
        query: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'users'
        `
      })
    
    console.log('🔍 RLS policies:', { policies, policiesError })
    
    // Try to create a user with different approaches
    const testWalletAddress = `TEST_WALLET_RLS_${Date.now()}`
    
    // Approach 1: Try with explicit role specification
    const { data: user1, error: error1 } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress + '_1',
        email: 'test1@example.com',
        name: 'Test User 1',
        role: 'OPERATOR'
      })
      .select()
      .single()
    
    // Approach 2: Try without role (let database use default)
    const { data: user2, error: error2 } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress + '_2',
        email: 'test2@example.com',
        name: 'Test User 2'
        // No role specified
      })
      .select()
      .single()
    
    // Approach 3: Try with ADMIN role
    const { data: user3, error: error3 } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress + '_3',
        email: 'test3@example.com',
        name: 'Test User 3',
        role: 'ADMIN'
      })
      .select()
      .single()
    
    // Clean up any created users
    if (user1) await supabase.from('users').delete().eq('wallet_address', testWalletAddress + '_1')
    if (user2) await supabase.from('users').delete().eq('wallet_address', testWalletAddress + '_2')
    if (user3) await supabase.from('users').delete().eq('wallet_address', testWalletAddress + '_3')
    
    return NextResponse.json({
      success: true,
      rlsEnabled: {
        success: !rlsError,
        error: rlsError?.message,
        data: rlsEnabled
      },
      policies: {
        success: !policiesError,
        error: policiesError?.message,
        data: policies
      },
      userCreationTests: {
        withOperatorRole: {
          success: !error1,
          error: error1?.message,
          data: user1
        },
        withoutRole: {
          success: !error2,
          error: error2?.message,
          data: user2
        },
        withAdminRole: {
          success: !error3,
          error: error3?.message,
          data: user3
        }
      }
    })
  } catch (error) {
    console.error('❌ Error in debug RLS endpoint:', error)
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