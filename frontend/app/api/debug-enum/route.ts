import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Enum debug endpoint called')
    
    // Test different enum values for user_role
    const testValues = ['USER', 'OPERATOR', 'ADMIN', 'user', 'operator', 'admin']
    
    const results = {}
    
    for (const roleValue of testValues) {
      console.log(`🔍 Testing role value: ${roleValue}`)
      
      const testWallet = `TEST_WALLET_${roleValue}_${Date.now()}`
      
      const { data: user, error: error } = await supabase
        .from('users')
        .insert({
          wallet_address: testWallet,
          email: `test-${roleValue}@example.com`,
          name: `Test ${roleValue}`,
          role: roleValue
        })
        .select()
        .single()
      
      results[roleValue] = {
        success: !error,
        error: error?.message,
        data: user
      }
      
      // Clean up if successful
      if (user) {
        await supabase.from('users').delete().eq('id', user.id)
      }
      
      console.log(`🔍 Result for ${roleValue}:`, results[roleValue])
    }
    
    // Also try to get existing users to see what roles they have
    const { data: existingUsers, error: existingUsersError } = await supabase
      .from('users')
      .select('role')
      .limit(10)
    
    console.log('🔍 Existing users roles:', { existingUsers, existingUsersError })
    
    return NextResponse.json({
      success: true,
      enumTests: results,
      existingUsers: {
        success: !existingUsersError,
        error: existingUsersError?.message,
        data: existingUsers
      }
    })
  } catch (error) {
    console.error('❌ Error in enum debug endpoint:', error)
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