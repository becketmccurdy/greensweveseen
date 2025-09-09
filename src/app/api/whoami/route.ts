import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return NextResponse.json({ hasSession: false, error: error.message }, { status: 200 })
    }

    return NextResponse.json({
      hasSession: !!user,
      user: user ? { id: user.id, email: user.email } : null,
    }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ hasSession: false, error: e?.message || String(e) }, { status: 500 })
  }
}
