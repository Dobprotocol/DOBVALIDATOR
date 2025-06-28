import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../auth/verify/route'
import { supabase } from '@/lib/supabase'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Users POST request received')
    
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    console.log('🔍 Auth result:', { valid: auth.valid, user: auth.user })
    
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('🔍 Users POST body:', body)
    
    const { email, name, role } = body
    const walletAddress = auth.user.walletAddress
    
    console.log('🔍 Creating user for wallet:', walletAddress)
    
    // First, check if user already exists
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()
    
    if (existingUser) {
      console.log('🔍 User already exists:', existingUser)
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'User already exists'
      })
    }
    
    // Try to create user with proper authentication context
    // The key is to ensure the RLS policies can see the authenticated user
    console.log('🔍 Creating new user...')
    
    // Try different role values to find the correct one
    const roleValues = ['OPERATOR', 'USER', 'user', 'operator']
    let userCreated = false
    let createdUser = null
    let lastError = null
    
    for (const roleValue of roleValues) {
      try {
        console.log(`🔍 Trying to create user with role: ${roleValue}`)
        
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            email: email || null,
            name: name || null,
            role: roleValue
          })
          .select()
          .single()
        
        if (!userError && newUser) {
          console.log(`✅ User created successfully with role: ${roleValue}`)
          createdUser = newUser
          userCreated = true
          break
        } else {
          console.log(`❌ Failed to create user with role ${roleValue}:`, userError?.message)
          lastError = userError
        }
      } catch (error) {
        console.log(`❌ Exception creating user with role ${roleValue}:`, error.message)
        lastError = error
      }
    }
    
    if (!userCreated) {
      console.error('❌ Failed to create user with any role value')
      return NextResponse.json(
        { 
          error: 'Failed to create user account', 
          details: lastError?.message || 'Could not create user with any valid role',
          lastError: lastError
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: createdUser,
      message: 'User created successfully'
    })
    
  } catch (error) {
    console.error('❌ Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Users GET request received')
    
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const walletAddress = auth.user.walletAddress
    
    // Get user by wallet address
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      throw error
    }
    
    return NextResponse.json({
      success: true,
      user
    })
    
  } catch (error) {
    console.error('❌ Error getting user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 