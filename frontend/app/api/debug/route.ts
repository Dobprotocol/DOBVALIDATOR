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
    
    // Get table information
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info')
      .select('*')
    
    console.log('🔍 Tables info:', { tables, tablesError })
    
    return NextResponse.json({
      success: true,
      supabaseConnection: !testError,
      testError: testError?.message,
      usersTable: {
        exists: !usersError,
        error: usersError?.message,
        sampleData: users?.[0] || null
      },
      profilesTable: {
        exists: !profilesError,
        error: profilesError?.message,
        sampleData: profiles?.[0] || null
      },
      tablesInfo: {
        exists: !tablesError,
        error: tablesError?.message,
        data: tables || null
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