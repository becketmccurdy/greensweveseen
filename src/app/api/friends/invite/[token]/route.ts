import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, context: any) {
  const raw = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const { token } = (raw || {}) as { token: string }
  
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
  try {
    const invite = await prisma.friendInvite.findUnique({ where: { token } })
    if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
    
    // Check if invite is expired (14 days)
    const expirationDate = new Date(invite.createdAt)
    expirationDate.setDate(expirationDate.getDate() + 14)
    const isExpired = new Date() > expirationDate
    
    if (isExpired && invite.status === 'PENDING') {
      // Auto-expire the invite
      await prisma.friendInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json({ status: 'EXPIRED', email: invite.email, phone: invite.phone })
    }
    
    return NextResponse.json({ status: invite.status, email: invite.email, phone: invite.phone })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load invite' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: any) {
  const raw = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const { token } = (raw || {}) as { token: string }
  
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
  
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const invite = await prisma.friendInvite.findUnique({ where: { token } })
    if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
    
    // Check if invite is expired (14 days)
    const expirationDate = new Date(invite.createdAt)
    expirationDate.setDate(expirationDate.getDate() + 14)
    const isExpired = new Date() > expirationDate
    
    if (isExpired && invite.status === 'PENDING') {
      await prisma.friendInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }
    
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
    
    let friendshipCreated = false
    if (!existing) {
      await prisma.friendship.create({
        data: { userId: invite.inviterId, friendId: user.id, status: 'ACCEPTED' },
      })
      friendshipCreated = true
    }

    await prisma.friendInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })

    // Add friend activity entries for both users if friendship was created
    if (friendshipCreated) {
      const inviterProfile = await prisma.userProfile.findUnique({
        where: { userId: invite.inviterId },
        select: { firstName: true, lastName: true, email: true }
      })
      const accepterProfile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: { firstName: true, lastName: true, email: true }
      })

      const inviterName = inviterProfile ? 
        [inviterProfile.firstName, inviterProfile.lastName].filter(Boolean).join(' ') || inviterProfile.email || 'Unknown' : 'Unknown'
      const accepterName = accepterProfile ? 
        [accepterProfile.firstName, accepterProfile.lastName].filter(Boolean).join(' ') || accepterProfile.email || 'Unknown' : 'Unknown'

      // Activity for the inviter
      await prisma.friendActivity.create({
        data: {
          userId: invite.inviterId,
          type: 'ROUND_COMPLETED', // Temporary - will be FRIEND_ADDED after DB migration
          data: {
            friendId: user.id,
            friendName: accepterName,
            action: 'invite_accepted',
            type: 'friend_added'
          }
        }
      })

      // Activity for the accepter
      await prisma.friendActivity.create({
        data: {
          userId: user.id,
          type: 'ROUND_COMPLETED', // Temporary - will be FRIEND_ADDED after DB migration
          data: {
            friendId: invite.inviterId,
            friendName: inviterName,
            action: 'invite_accepted',
            type: 'friend_added'
          }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 })
  }
}
