import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Profile validation schema
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Invalid email address'),
})

// Check if we're in development mode
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         process.env.NODE_ENV === 'test'
}

// Get authenticated user from JWT token
async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header found')
      return null
    }

    const token = authHeader.substring(7)
    
    // Always verify the token with the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com'
    const response = await fetch(`${backendUrl}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log('❌ Backend authentication failed:', response.status)
      return null
    }

    const data = await response.json()
    console.log('✅ User authenticated via backend:', data.user || data.profile)
    return data.user || data.profile
  } catch (error) {
    console.error('❌ Error getting authenticated user:', error)
    return null
  }
}

// Get profile from backend database
async function getProfile(user: any) {
  try {
    console.log('🔍 Querying backend for profile with wallet address:', user.walletAddress || user.wallet_address)
    
    // Query backend database
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com'
    const response = await fetch(`${backendUrl}/api/profile`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Profile retrieved from backend database')
      return data.profile
    }

    // Profile not found in database
    console.log('ℹ️ No profile found in database for wallet:', user.walletAddress || user.wallet_address)
    throw new Error('Profile not found')
  } catch (error) {
    console.error('❌ Error getting profile from database:', error)
    throw error
  }
}



export async function GET(request: NextRequest) {
  console.log('🔍 Profile GET request received')
  
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    console.log('❌ Authentication required')
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  console.log('✅ User authenticated:', user.walletAddress || user.wallet_address)
  
  const profile = await getProfile(user)

  return NextResponse.json({
    success: true,
    profile
  })
}

export async function POST(request: NextRequest) {
  console.log('🔍 Profile POST request received')
  
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    console.log('❌ Authentication required')
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  console.log('✅ User authenticated:', user.walletAddress || user.wallet_address)

  const body = await request.json()
  const validationResult = profileSchema.safeParse(body)
  
  if (!validationResult.success) {
    console.log('❌ Validation failed:', validationResult.error.format())
    return NextResponse.json({ 
      error: 'Invalid profile data', 
      details: validationResult.error.format() 
    }, { status: 400 })
  }
  
  const profileData = validationResult.data
  console.log('✅ Profile data validated:', profileData)

  try {
    // Always save to backend database
    console.log('🔍 Saving profile to backend database for wallet:', user.walletAddress || user.wallet_address)
    
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com'
    const response = await fetch(`${backendUrl}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || ''
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Profile saved to backend database')
    
    return NextResponse.json({
      success: true,
      profile: data.profile
    })
  } catch (error) {
    console.error('❌ Error saving profile to database:', error)
    return NextResponse.json({ 
      error: 'Failed to save profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  return POST(request) // Use same logic as POST for updates
}

export async function DELETE(request: NextRequest) {
  console.log('🔍 Profile DELETE request received')
  
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    console.log('❌ Authentication required')
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    // In development mode, remove from local storage
    if (isDevelopmentMode()) {
      localStorage.removeItem(`localProfile_${user.walletAddress || user.wallet_address}`)
      console.log('✅ Profile removed from local storage')
      
      return NextResponse.json({
        success: true,
        message: 'Profile deleted (development mode)'
      })
    }

    // In production, delete from backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com'
    const response = await fetch(`${backendUrl}/api/profile`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('authorization') || ''
      }
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    console.log('✅ Profile deleted from backend')
    
    return NextResponse.json({
      success: true,
      message: 'Profile deleted'
    })
  } catch (error) {
    console.error('❌ Error deleting profile:', error)
    return NextResponse.json({ 
      error: 'Failed to delete profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request) // Use same logic as POST for partial updates
} 