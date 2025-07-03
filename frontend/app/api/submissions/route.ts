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
    let backendUrl = getSafeBackendUrl()
    console.log('🔍 [GET] Initial backendUrl from getSafeBackendUrl:', backendUrl)

    // Final fallback: if still on the frontend domain, force the backend URL
    if (backendUrl.includes('validator.dobprotocol.com')) {
      console.log('🔍 [GET] Forcing backend URL to v.dobprotocol.com')
      backendUrl = 'https://v.dobprotocol.com'
    }
    const submissionsUrl = `${backendUrl}/api/submissions`
    console.log('🔍 [GET] Final submissionsUrl:', submissionsUrl)

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
    let backendUrl = getSafeBackendUrl()
    console.log('🔍 [API Route] Initial backendUrl from getSafeBackendUrl:', backendUrl)

    // Final fallback: if still on the frontend domain, force the backend URL
    if (backendUrl.includes('validator.dobprotocol.com')) {
      console.log('🔍 [API Route] Forcing backend URL to v.dobprotocol.com')
      backendUrl = 'https://v.dobprotocol.com'
    }
    const submissionsUrl = `${backendUrl}/api/submissions`
    console.log('🔍 [API Route] Final submissionsUrl:', submissionsUrl)
    console.log('🔍 [API Route] NODE_ENV:', process.env.NODE_ENV)
    console.log('🔍 [API Route] NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL)

    // Parse the request body as JSON (since we're converting FormData to JSON in the frontend)
    console.log('🔍 Processing JSON request')
    
    const body = await request.json()
    console.log('🔍 Request body:', body)

    // Forward the request to the backend
    const backendResponse = await fetch(submissionsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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