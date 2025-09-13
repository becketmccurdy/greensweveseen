import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get activities from friends
    const activities = await prisma.friendActivity.findMany({
      where: {
        OR: [
          { userId: user.id }, // User's own activities
          {
            user: {
              OR: [
                {
                  friendshipsAsUser: {
                    some: {
                      friendId: user.id,
                      status: 'ACCEPTED'
                    }
                  }
                },
                {
                  friendshipsAsFriend: {
                    some: {
                      userId: user.id,
                      status: 'ACCEPTED'
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching friend activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { type, data } = body

  try {
    const activity = await prisma.friendActivity.create({
      data: {
        userId: user.id,
        type,
        data
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
