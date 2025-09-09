import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // TEMPORARY: Disable all middleware to test deployment
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and API routes
     */
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|ico|png|jpg|jpeg|gif|webp|js|css|woff|woff2)$).*)',
  ],
}
