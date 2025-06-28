import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug enum endpoint called')
    
    // Test different role values to see which ones work
    const roleValues = [
      'USER', 'user', 'ADMIN', 'admin', 'OPERATOR', 'operator',
      'standard', 'STANDARD', 'basic', 'BASIC', 'member', 'MEMBER'
    ]
    
    const results = []
    
    for (const role of roleValues) {
      try {
        const testWalletAddress = `TEST_WALLET_${role}_${Date.now()}`
        
        const { data, error } = await supabase
          .from('users')
          .insert({
            wallet_address: testWalletAddress,
            email: `test-${role}@example.com`,
            name: `Test ${role}`,
            role: role
          })
          .select()
          .single()
        
        // Clean up test data
        await supabase.from('users').delete().eq('wallet_address', testWalletAddress)
        
        results.push({
          role,
          success: !error,
          error: error?.message || null,
          data: data || null
        })
        
        console.log(`🔍 Tested role "${role}":`, { success: !error, error: error?.message })
      } catch (error) {
        results.push({
          role,
          success: false,
          error: error.message,
          data: null
        })
        console.log(`❌ Exception testing role "${role}":`, error.message)
      }
    }
    
    // Also try to get the enum values from the database schema
    const { data: enumData, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'user_role' })
    
    return NextResponse.json({
      success: true,
      roleTests: results,
      enumValues: {
        success: !enumError,
        error: enumError?.message,
        data: enumData
      }
    })
  } catch (error) {
    console.error('❌ Error in debug enum endpoint:', error)
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