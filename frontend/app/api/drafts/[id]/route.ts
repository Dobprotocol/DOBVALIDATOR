import { NextRequest, NextResponse } from 'next/server'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Frontend draft GET request received for ID:', params.id)
    
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
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com'
    const draftUrl = `${backendUrl}/api/drafts/${params.id}`

    console.log('🔍 Forwarding to backend:', draftUrl)

    // Forward the request to the backend
    const backendResponse = await fetch(draftUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('🔍 Backend response status:', backendResponse.status)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('❌ Backend draft request failed:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    console.log('✅ Backend draft request successful:', responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Frontend draft endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Frontend draft PUT request received for ID:', params.id)
    
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
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com'
    const draftUrl = `${backendUrl}/api/drafts/${params.id}`

    console.log('🔍 Forwarding to backend:', draftUrl)

    // Parse the request body
    const body = await request.json()
    console.log('🔍 Request body:', body)

    // Forward the request to the backend
    const backendResponse = await fetch(draftUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
      })

    console.log('🔍 Backend response status:', backendResponse.status)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('❌ Backend draft request failed:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    console.log('✅ Backend draft request successful:', responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Frontend draft endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Frontend draft DELETE request received for ID:', params.id)
    
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
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com'
    const draftUrl = `${backendUrl}/api/drafts/${params.id}`

    console.log('🔍 Forwarding to backend:', draftUrl)

    // Forward the request to the backend
    const backendResponse = await fetch(draftUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('🔍 Backend response status:', backendResponse.status)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('❌ Backend draft request failed:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    console.log('✅ Backend draft request successful:', responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Frontend draft endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
} 