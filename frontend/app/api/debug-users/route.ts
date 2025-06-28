import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug users endpoint called')
    
    // Get all users in the database
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('🔍 All users:', allUsers)
    
    // Try to find the specific wallet address with different case variations
    const targetWallet = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
    
    const { data: exactMatch, error: exactError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', targetWallet)
    
    const { data: caseInsensitiveMatch, error: caseError } = await supabase
      .from('users')
      .select('*')
      .ilike('wallet_address', targetWallet)
    
    // Try with partial match
    const { data: partialMatch, error: partialError } = await supabase
      .from('users')
      .select('*')
      .ilike('wallet_address', '%GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN%')
    
    return NextResponse.json({
      success: true,
      allUsers: {
        success: !allUsersError,
        error: allUsersError?.message,
        count: allUsers?.length || 0,
        data: allUsers
      },
      exactMatch: {
        success: !exactError,
        error: exactError?.message,
        count: exactMatch?.length || 0,
        data: exactMatch
      },
      caseInsensitiveMatch: {
        success: !caseError,
        error: caseError?.message,
        count: caseInsensitiveMatch?.length || 0,
        data: caseInsensitiveMatch
      },
      partialMatch: {
        success: !partialError,
        error: partialError?.message,
        count: partialMatch?.length || 0,
        data: partialMatch
      },
      targetWallet
    })
  } catch (error) {
    console.error('❌ Error in debug users endpoint:', error)
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