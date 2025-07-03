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
    const { getSafeBackendUrl } = await import('../../../lib/api-utils')
    const backendUrl = getSafeBackendUrl()
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
    const { getSafeBackendUrl } = await import('../../../lib/api-utils')
    const backendUrl = getSafeBackendUrl()
    const draftsUrl = `${backendUrl}/api/drafts`;

    console.log('🔍 Forwarding to backend:', draftsUrl);

    // Check if this is FormData or JSON
    const contentType = request.headers.get('content-type') || '';
    console.log('🔍 Content-Type:', contentType);

    let backendResponse: Response;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      console.log('🔍 Processing FormData request');
      
      // Get the FormData from the request
      const formData = await request.formData();
      
      // Forward the FormData to the backend
      backendResponse = await fetch(draftsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let fetch set it with boundary
        },
        body: formData
      });
    } else {
      // Handle JSON
      console.log('🔍 Processing JSON request');
      
      // Parse the request body
      const body = await request.json();
      console.log('🔍 Request body:', body);

      // Safety filter: Remove customDeviceType to prevent backend schema issues
      const { customDeviceType, ...filteredBody } = body;
      console.log('🔍 Filtered body (removed customDeviceType):', filteredBody);

      // Forward the request to the backend
      backendResponse = await fetch(draftsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filteredBody)
      });
    }

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