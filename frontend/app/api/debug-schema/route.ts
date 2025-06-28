import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug schema endpoint called')
    
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    console.log('🔍 Tables in public schema:', { tables, tablesError })
    
    // Get all columns in the users table
    const { data: userColumns, error: userColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
    
    console.log('🔍 Users table columns:', { userColumns, userColumnsError })
    
    // Get all enums in the public schema
    const { data: enums, error: enumsError } = await supabase
      .from('pg_enum')
      .select('enumlabel')
      .eq('enumtypid', (
        await supabase
          .from('pg_type')
          .select('oid')
          .eq('typname', 'user_role')
          .single()
      ).data?.oid)
    
    console.log('🔍 User role enum values:', { enums, enumsError })
    
    // Try to get the actual enum type definition
    const { data: enumType, error: enumTypeError } = await supabase
      .from('pg_type')
      .select('typname, typtype')
      .eq('typname', 'user_role')
    
    console.log('🔍 User role enum type:', { enumType, enumTypeError })
    
    // Try to create a user without specifying role (let database use default)
    const testWalletAddress = `TEST_WALLET_DEFAULT_${Date.now()}`
    const { data: testUserDefault, error: testUserDefaultError } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress,
        email: 'test-default@example.com',
        name: 'Test Default Role'
        // No role specified - let database use default
      })
      .select()
      .single()
    
    // Clean up test data
    if (testUserDefault) {
      await supabase.from('users').delete().eq('wallet_address', testWalletAddress)
    }
    
    // Try to get existing users to see what roles they have
    const { data: existingUsers, error: existingUsersError } = await supabase
      .from('users')
      .select('wallet_address, role, created_at')
      .limit(5)
    
    console.log('🔍 Existing users:', { existingUsers, existingUsersError })
    
    return NextResponse.json({
      success: true,
      tables: {
        success: !tablesError,
        error: tablesError?.message,
        data: tables
      },
      userColumns: {
        success: !userColumnsError,
        error: userColumnsError?.message,
        data: userColumns
      },
      enums: {
        success: !enumsError,
        error: enumsError?.message,
        data: enums
      },
      enumType: {
        success: !enumTypeError,
        error: enumTypeError?.message,
        data: enumType
      },
      testUserDefault: {
        success: !testUserDefaultError,
        error: testUserDefaultError?.message,
        data: testUserDefault
      },
      existingUsers: {
        success: !existingUsersError,
        error: existingUsersError?.message,
        data: existingUsers
      }
    })
  } catch (error) {
    console.error('❌ Error in debug schema endpoint:', error)
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