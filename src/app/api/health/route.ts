import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function redact(s: string) {
  if (!s) return s
  return s.length <= 2 ? '*'.repeat(s.length) : s[0] + '***' + s[s.length - 1]
}

function parseDbUrl(raw?: string) {
  if (!raw) return null
  try {
    // Basic parse without leaking secrets. URL won't parse 'postgresql://' with node URL
    // unless we replace scheme to 'http' temporarily, so do manual parsing.
    const withoutScheme = raw.replace(/^postgres(?:ql)?:\/\//, '')
    // user:pass@host:port/db?query
    const parts = withoutScheme.split('/')
    if (parts.length === 0) return { parseError: true }
    const authAndHost = parts[0]
    const pathAndQuery = parts.slice(1).join('/')
    if (!authAndHost || !authAndHost.includes('@')) return { parseError: true }
    const [auth, hostAndPort] = authAndHost.split('@')
    if (!auth || !hostAndPort) return { parseError: true }
    const [user] = auth.split(':')
    const [host, port] = hostAndPort.split(':')
    const [dbAndMaybeQuery] = (pathAndQuery || '').split('?')
    const query = raw.includes('?') ? raw.substring(raw.indexOf('?') + 1) : ''
    const flags = new URLSearchParams(query)
    return {
      user: redact(user || ''),
      host,
      port,
      db: dbAndMaybeQuery,
      hasPgbouncer: flags.get('pgbouncer') === 'true',
      hasConnLimit1: flags.get('connection_limit') === '1',
      sslmode: flags.get('sslmode') || null,
    }
  } catch {
    return { parseError: true }
  }
}

export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    NODE_ENV: process.env.NODE_ENV,
  }

  const dbInfo = parseDbUrl(process.env.DATABASE_URL)
  const directInfo = parseDbUrl(process.env.DIRECT_URL)

  const result: any = { env, dbInfo, directInfo }

  try {
    // Simple DB connectivity check
    const rows = await prisma.$queryRawUnsafe<{ ok: number }[]>(`select 1 as ok`)
    result.db = { ok: Array.isArray(rows) && rows.length > 0 }
    return NextResponse.json(result, { status: 200 })
  } catch (e: any) {
    result.db = { ok: false, error: e?.message || String(e) }
    return NextResponse.json(result, { status: 500 })
  }
}
