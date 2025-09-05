import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
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
     * - auth (OAuth callbacks)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login|auth).*)',
  ],
}
