import { NextRequest, NextResponse } from 'next/server'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Frontend profile image upload request received')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 Token extracted:', token.substring(0, 20) + '...')

    // Get the backend URL
    const { getSafeBackendUrl } = await import('../../../../lib/api-utils')
    const backendUrl = getSafeBackendUrl()
    const uploadUrl = `${backendUrl}/api/profile/upload-image`

    console.log('🔍 Forwarding to backend:', uploadUrl)

    // Get the FormData from the request
    const formData = await request.formData()
    console.log('🔍 FormData entries:', Array.from(formData.entries()).map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`))
    
    // Forward the FormData to the backend
    const backendResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - let fetch set it with boundary
      },
      body: formData
    })
    
    console.log('🔍 Backend response status:', backendResponse.status)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('❌ Backend profile image upload failed:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    console.log('✅ Backend profile image upload successful:', responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Frontend profile image upload endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
} 