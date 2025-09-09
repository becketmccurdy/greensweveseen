import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for public assets and auth routes
  const publicPaths = [
    '/manifest.json',
    '/sw.js',
    '/robots.txt',
    '/favicon.ico',
    '/favicon.svg',
    '/screenshot-mobile.png',
  ]
  
  const skipPaths = [
    '/login',
    '/auth',
    '/privacy',
    '/terms',
    '/debug',
  ]

  if (
    path.startsWith('/_next/') ||
    path.startsWith('/api/') ||
    path.startsWith('/icon-') ||
    path.startsWith('/apple-touch-icon') ||
    publicPaths.includes(path) ||
    skipPaths.includes(path)
  ) {
    return NextResponse.next()
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and API routes
     */
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|ico|png|jpg|jpeg|gif|webp|js|css|woff|woff2)$).*)',
  ],
}
