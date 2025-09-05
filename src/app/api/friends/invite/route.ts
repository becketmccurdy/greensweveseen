import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import crypto from 'node:crypto'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { email, phone } = body || {}

  if (!email && !phone) {
    return NextResponse.json({ error: 'Provide an email or phone' }, { status: 400 })
  }

  try {
    const token = crypto.randomBytes(24).toString('hex')

    const invite = await prisma.friendInvite.create({
      data: {
        inviterId: user.id,
        email: email || null,
        phone: phone || null,
        token,
      }
    })

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    const url = `${origin}/invite/${invite.token}`

    return NextResponse.json({ token: invite.token, url })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}
