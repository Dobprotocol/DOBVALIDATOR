import { NextRequest, NextResponse } from 'next/server'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Frontend submit endpoint received request')
    
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
    const submitUrl = `${backendUrl}/api/submissions`

    console.log('🔍 Forwarding to backend:', submitUrl)

    // Parse the request body based on content type
    const contentType = request.headers.get('content-type') || ''
    let submissionData: any = {}
    let files: Array<{
      filename: string
      path: string
      size: number
      mimeType: string
      documentType: string
    }> = []

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData()
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Handle file uploads
          const fileData = {
            filename: value.name,
            path: `/uploads/${value.name}`, // This would be the actual uploaded path
            size: value.size,
            mimeType: value.type,
            documentType: key // Use the field name as document type
          }
          files.push(fileData)
        } else {
          // Handle regular form fields
          submissionData[key] = value
        }
      }
    } else if (contentType.includes('application/json')) {
      // Handle JSON
      submissionData = await request.json()
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported content type. Use multipart/form-data or application/json' },
        { status: 400 }
      )
    }

    // Add files to submission data if any
    if (files.length > 0) {
      submissionData.files = files
    }

    console.log('🔍 Submission data prepared:', {
      ...submissionData,
      files: files.length
    })

    // Forward the request to the backend
    const backendResponse = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    })

    console.log('🔍 Backend response status:', backendResponse.status)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('❌ Backend submission failed:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || errorData.message || `Backend error: ${backendResponse.status}` 
        },
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    console.log('✅ Backend submission successful:', responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Frontend submit endpoint error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
} 