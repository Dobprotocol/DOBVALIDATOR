import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 RLS debug endpoint called')
    
    // Check what enum values actually exist in the database
    const { data: enumValues, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'user_role' })
    
    console.log('🔍 Enum values:', { enumValues, enumError })
    
    // Check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_rls_policies', { table_name: 'users' })
    
    console.log('🔍 RLS policies:', { policies, policiesError })
    
    // Try to get the actual table definition
    const { data: tableDef, error: tableDefError } = await supabase
      .rpc('get_table_definition', { table_name: 'users' })
    
    console.log('🔍 Table definition:', { tableDef, tableDefError })
    
    // Check if we can query the enum type directly
    const { data: enumType, error: enumTypeError } = await supabase
      .from('pg_enum')
      .select('enumlabel')
      .eq('enumtypid', '(SELECT oid FROM pg_type WHERE typname = \'user_role\')')
    
    console.log('🔍 Enum type:', { enumType, enumTypeError })
    
    return NextResponse.json({
      success: true,
      enumValues: {
        success: !enumError,
        error: enumError?.message,
        data: enumValues
      },
      rlsPolicies: {
        success: !policiesError,
        error: policiesError?.message,
        data: policies
      },
      tableDefinition: {
        success: !tableDefError,
        error: tableDefError?.message,
        data: tableDef
      },
      enumType: {
        success: !enumTypeError,
        error: enumTypeError?.message,
        data: enumType
      }
    })
  } catch (error) {
    console.error('❌ Error in RLS debug endpoint:', error)
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