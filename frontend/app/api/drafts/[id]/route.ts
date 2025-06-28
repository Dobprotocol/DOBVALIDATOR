import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../auth/verify/route'

// Delete a draft by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Draft DELETE request received for ID:', params.id)
    
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    console.log('🔍 Auth result:', { valid: auth.valid, user: auth.user })
    
    if (!auth.valid) {
      console.log('❌ Authentication failed')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const draftId = params.id
    console.log('🔍 Deleting draft ID:', draftId)

    // Forward to backend database
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const authToken = request.headers.get('authorization')
    console.log('🔍 Backend URL:', backendUrl)
    console.log('🔍 Auth token present:', !!authToken)
    
    const response = await fetch(`${backendUrl}/api/drafts/${draftId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authToken || ''
      }
    })

    console.log('🔍 Backend response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Backend delete error:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'Failed to delete draft' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Draft deleted successfully from backend')

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 