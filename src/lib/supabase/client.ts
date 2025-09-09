import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not set')
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  if (!anonKey) {
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  return createBrowserClient(url, anonKey)
}
