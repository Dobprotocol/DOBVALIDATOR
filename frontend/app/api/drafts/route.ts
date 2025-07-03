import { NextRequest, NextResponse } from 'next/server';

// Required for API routes in Next.js
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Frontend drafts GET request received');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token extracted:', token.substring(0, 20) + '...');

    // Get the backend URL
    const backendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com')
    const draftsUrl = `${backendUrl}/api/drafts`;

    console.log('🔍 Forwarding to backend:', draftsUrl);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build query string
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    
    const queryString = params.toString();
    const fullUrl = `${draftsUrl}${queryString ? `?${queryString}` : ''}`;

    // Forward the request to the backend
    const backendResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔍 Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('❌ Backend drafts request failed:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      );
        }

    const responseData = await backendResponse.json();
    console.log('✅ Backend drafts request successful:', responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Frontend drafts endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Frontend drafts POST request received');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token extracted:', token.substring(0, 20) + '...');

    // Get the backend URL
    const backendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://v.dobprotocol.com')
    const draftsUrl = `${backendUrl}/api/drafts`;

    console.log('🔍 Forwarding to backend:', draftsUrl);

    // Parse the request body
    const body = await request.json();
    console.log('🔍 Request body:', body);

    // Safety filter: Remove customDeviceType to prevent backend schema issues
    const { customDeviceType, ...filteredBody } = body;
    console.log('🔍 Filtered body (removed customDeviceType):', filteredBody);

    // Forward the request to the backend
    const backendResponse = await fetch(draftsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filteredBody)
    });

    console.log('🔍 Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('❌ Backend drafts request failed:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();
    console.log('✅ Backend drafts request successful:', responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Frontend drafts endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 