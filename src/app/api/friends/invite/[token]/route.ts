import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, context: any) {
  const raw = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const { token } = (raw || {}) as { token: string }
  try {
    const invite = await prisma.friendInvite.findUnique({ where: { token } })
    if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
    return NextResponse.json({ status: invite.status, email: invite.email, phone: invite.phone })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load invite' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: any) {
  const raw = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const { token } = (raw || {}) as { token: string }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const invite = await prisma.friendInvite.findUnique({ where: { token } })
    if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
    if (invite.status !== 'PENDING') return NextResponse.json({ error: 'Invite already used or expired' }, { status: 400 })
    if (invite.inviterId === user.id) return NextResponse.json({ error: 'Cannot accept your own invite' }, { status: 400 })

    // Ensure both users have profiles
    await prisma.userProfile.upsert({
      where: { userId: invite.inviterId },
      update: {},
      create: { userId: invite.inviterId, email: invite.email || '' },
    })
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, email: user.email || '' },
    })

    // Check existing friendship
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: invite.inviterId, friendId: user.id },
          { userId: user.id, friendId: invite.inviterId },
        ],
      },
    })
    if (!existing) {
      await prisma.friendship.create({
        data: { userId: invite.inviterId, friendId: user.id, status: 'ACCEPTED' },
      })
    }

    await prisma.friendInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 })
  }
}
