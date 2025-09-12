import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createInviteSchema } from '@/lib/validations/invite'
import crypto from 'node:crypto'

export async function POST(request: NextRequest) {
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const validation = createInviteSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json({ 
      error: 'Invalid input', 
      details: validation.error.flatten().fieldErrors 
    }, { status: 400 })
  }

  const { email, phone } = validation.data

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
