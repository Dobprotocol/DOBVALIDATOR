import { NextRequest, NextResponse } from 'next/server'

// Required for API routes in Next.js
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Frontend submit endpoint received request')
    
    // Check content length to prevent 413 errors
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength, 10)
      const MAX_REQUEST_SIZE = 50 * 1024 * 1024 // 50MB
      if (size > MAX_REQUEST_SIZE) {
        console.error(`❌ Request too large: ${size} bytes (max: ${MAX_REQUEST_SIZE})`);
        return NextResponse.json(
          { success: false, error: 'Request too large. Maximum size is 50MB.' },
          { status: 413 }
        )
      }
    }
    
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
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
      
      // Define file size limits (10MB per file, 50MB total)
      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
      const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB
      let totalFileSize = 0
      
      // Define the fields that are allowed in the backend schema
      const allowedFields = [
        'deviceName', 'deviceType', 'customDeviceType', 'location', 'serialNumber', 
        'manufacturer', 'model', 'yearOfManufacture', 'condition', 'specifications',
        'purchasePrice', 'currentValue', 'expectedRevenue', 'operationalCosts', 'draftId'
      ]
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Check file size
          if (value.size > MAX_FILE_SIZE) {
            console.error(`❌ File too large: ${value.name} (${value.size} bytes, max: ${MAX_FILE_SIZE})`);
            return NextResponse.json(
              { success: false, error: `File ${value.name} is too large. Maximum size is 10MB.` },
              { status: 413 }
            )
          }
          
          totalFileSize += value.size
          if (totalFileSize > MAX_TOTAL_SIZE) {
            console.error(`❌ Total file size too large: ${totalFileSize} bytes (max: ${MAX_TOTAL_SIZE})`);
            return NextResponse.json(
              { success: false, error: 'Total file size exceeds 50MB limit.' },
              { status: 413 }
            )
          }
          
          // Handle file uploads
          const fileData = {
            filename: value.name,
            path: `/uploads/${value.name}`, // This would be the actual uploaded path
            size: value.size,
            mimeType: value.type,
            documentType: key // Use the field name as document type
          }
          files.push(fileData)
        } else if (allowedFields.includes(key)) {
          // Only include fields that are defined in the backend schema
          submissionData[key] = value
        }
      }
    } else if (contentType.includes('application/json')) {
      // Handle JSON
      submissionData = await request.json()
    } else {
      return NextResponse.json(
        { success: false, error: 'Content-Type was not one of "multipart/form-data" or "application/x-www-form-urlencoded".' },
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