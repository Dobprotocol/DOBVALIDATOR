import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Simple test endpoint called')
    
    // Test the exact getUserByWallet logic
    const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
    
    console.log('🔍 Testing getUserByWallet with wallet:', walletAddress)
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()
    
    console.log('🔍 getUserByWallet result:', { data, error })
    
    if (error) {
      console.log('❌ getUserByWallet error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }
    
    return NextResponse.json({
      success: true,
      walletAddress,
      userFound: !!data,
      data,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      } : null
    })
  } catch (error) {
    console.error('❌ Error in simple test endpoint:', error)
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