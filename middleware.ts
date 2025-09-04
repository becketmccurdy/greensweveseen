import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // For Firebase auth, we handle session management on client-side
  // Just allow requests to pass through for now
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth routes)
     * - login (login page)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)',
  ],
}

