import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Skip all internal Next.js paths and public assets
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|icon-.*|apple-touch-icon.*|manifest.json|sw.js|robots.txt|screenshot-mobile.png|api|login|auth|privacy|terms|debug).*)',
  ],
}
