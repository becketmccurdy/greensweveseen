import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Allow Next internals, auth routes, login, and public PWA assets to bypass middleware
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|icon-.*|apple-touch-icon.*|manifest.json|sw.js|robots.txt|screenshot-mobile.png|api/auth|login|auth).*)',
  ],
}
