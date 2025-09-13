import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  // Refresh the session to ensure it's up to date
  const { data: { session } } = await supabase.auth.getSession()
  
  // This is critical for maintaining session state across requests
  await supabase.auth.getUser()

  // Protect course creation and editing routes
  if (
    request.nextUrl.pathname.startsWith('/courses/new') ||
    request.nextUrl.pathname.match(/\/courses\/[^/]+\/edit/) ||
    (request.nextUrl.pathname.startsWith('/api/courses') && 
     ['POST', 'PUT', 'DELETE'].includes(request.method))
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
