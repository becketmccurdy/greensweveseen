import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const RoundBodySchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  // Allow 9-hole and partial score submissions
  totalScore: z.coerce.number().int().min(20).max(200),
  totalPar: z.coerce.number().int().min(20).max(90),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'date must be YYYY-MM-DD').optional(),
  weather: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  withFriends: z.coerce.boolean().optional(),
  friendUserIds: z.array(z.string()).max(10).optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rounds = await prisma.round.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: { name: true, location: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(rounds)
  } catch (error) {
    console.error('Error fetching rounds:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to fetch rounds', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error in rounds POST:', authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    console.log('Received round data:', JSON.stringify(json, null, 2))
    
    const parsed = RoundBodySchema.safeParse(json)
    if (!parsed.success) {
      console.error('Validation failed:', parsed.error.flatten())
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data
  
  try {
    // Ensure a user profile exists for FK integrity
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        email: user.email || '',
      }
    })

    // Filter friendUserIds to accepted friendships with current user
    const friendUserIds = Array.from(new Set((body.friendUserIds || []).filter(Boolean)))
    let allowedFriendIds: string[] = []
    if (friendUserIds.length > 0) {
      const accepted = await prisma.friendship.findMany({
        where: {
          status: 'ACCEPTED',
          OR: friendUserIds.map(fid => ({
            OR: [
              { userId: user.id, friendId: fid },
              { userId: fid, friendId: user.id },
            ]
          }))
        },
        select: { userId: true, friendId: true }
      })
      const set = new Set<string>()
      accepted.forEach(a => {
        if (a.userId === user.id) set.add(a.friendId)
        if (a.friendId === user.id) set.add(a.userId)
      })
      allowedFriendIds = friendUserIds.filter(id => set.has(id))
    }

    const round = await prisma.round.create({
      data: {
        userId: user.id,
        courseId: body.courseId,
        totalScore: body.totalScore,
        totalPar: body.totalPar,
        date: body.date ? new Date(body.date) : new Date(),
        weather: body.weather ?? null,
        notes: body.notes ?? null,
        withFriends: (body.withFriends || allowedFriendIds.length > 0) ? true : false,
      }
    })

    // Create RoundFriend entries if any allowed
    if (allowedFriendIds.length > 0) {
      await prisma.roundFriend.createMany({
        data: allowedFriendIds.map(fid => ({ roundId: round.id, friendUserId: fid })),
        skipDuplicates: true,
      })
    }

    // Record activity for feed (owner)
    try {
      await prisma.friendActivity.create({
        data: {
          userId: user.id,
          type: 'ROUND_COMPLETED',
          data: {
            roundId: round.id,
            courseId: body.courseId,
            totalScore: body.totalScore,
            totalPar: body.totalPar,
            withFriends: allowedFriendIds.length > 0,
            friends: allowedFriendIds,
          } as any,
        },
      })
    } catch (e) {
      console.warn('Failed to record friend activity for round:', e)
    }

    return NextResponse.json(round)
  } catch (error) {
    console.error('Error creating round:', error)
    return NextResponse.json(
      { error: 'Failed to create round', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
  } catch (outerError) {
    console.error('Outer error in rounds POST:', outerError)
    return NextResponse.json(
      { error: 'Internal server error', details: outerError instanceof Error ? outerError.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
