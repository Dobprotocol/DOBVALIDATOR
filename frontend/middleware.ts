import { NextRequest, NextResponse } from 'next/server'

// Protected API routes that require authentication
const protectedApiRoutes = [
  '/api/profile',
  '/api/submissions',
  '/api/certificates/generate',
]

// Public API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/challenge',
  '/api/auth/verify',
  '/api/certificates/verify',
  '/api/submit', // Legacy endpoint - consider migrating to /api/submissions
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if this is a public API route
  const isPublicApiRoute = publicApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Handle protected API routes
  if (isProtectedApiRoute) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Note: JWT verification is handled in individual API routes
    // This middleware just ensures the token is present
  }

  // Note: Frontend route protection is handled by the frontend components
  // using localStorage for JWT tokens, not by middleware

  // If it's an API route but not in our lists, allow it (for now)
  // In production, you might want to be more restrictive

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 