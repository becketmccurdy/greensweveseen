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
    '/health',
    '/test',
  ]

  // Always allow public assets without authentication
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

  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    const url = request.nextUrl.clone()
    url.pathname = '/health'
    return NextResponse.redirect(url)
  }

  // Only run auth middleware for protected routes
  try {
    return await updateSession(request)
  } catch (error) {
    console.error('Middleware error:', error)
    // If auth fails, redirect to login for protected routes
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and API routes
     */
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|ico|png|jpg|jpeg|gif|webp|js|css|woff|woff2)$).*)',
  ],
}
