import { NextRequest, NextResponse } from 'next/server'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Frontend submissions GET request received')
    
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
    const { getSafeBackendUrl } = await import('../../../lib/api-utils')
    const backendUrl = getSafeBackendUrl()
    const submissionsUrl = `${backendUrl}/api/submissions`

    console.log('🔍 Forwarding to backend:', submissionsUrl)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // Build query string
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (limit) params.append('limit', limit)
    if (offset) params.append('offset', offset)
    
    const queryString = params.toString()
    const fullUrl = `${submissionsUrl}${queryString ? `?${queryString}` : ''}`

    // Forward the request to the backend
    const backendResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('🔍 Backend response status:', backendResponse.status)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('❌ Backend submissions request failed:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    console.log('✅ Backend submissions request successful:', responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Frontend submissions endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Frontend submissions POST request received')
    console.log('🔍 Request URL:', request.url)
    console.log('🔍 Request method:', request.method)
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()))
    
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
    const { getSafeBackendUrl } = await import('../../../lib/api-utils')
    const backendUrl = getSafeBackendUrl()
    const submissionsUrl = `${backendUrl}/api/submissions`

    console.log('🔍 Forwarding to backend:', submissionsUrl)

    // Check if this is FormData or JSON
    const contentType = request.headers.get('content-type') || ''
    console.log('🔍 Content-Type:', contentType)

    let backendResponse: Response

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      console.log('🔍 Processing FormData request')
      
      // Get the FormData from the request
      const formData = await request.formData()
      console.log('🔍 FormData entries:', Array.from(formData.entries()).map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`))
      
      // Forward the FormData to the backend
      backendResponse = await fetch(submissionsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let fetch set it with boundary
        },
        body: formData
      })
      
      console.log('🔍 Backend response status:', backendResponse.status)
      console.log('🔍 Backend response headers:', Object.fromEntries(backendResponse.headers.entries()))
    } else {
      // Handle JSON
      console.log('🔍 Processing JSON request')
      
      // Parse the request body
      const body = await request.json()
      console.log('🔍 Request body:', body)

      // Forward the request to the backend
      backendResponse = await fetch(submissionsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
    }

    console.log('🔍 Backend response status:', backendResponse.status)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('❌ Backend submissions request failed:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    console.log('✅ Backend submissions request successful:', responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Frontend submissions endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
} 