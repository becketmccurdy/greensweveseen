import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all friendships for the user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id },
          { friendId: user.id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            handicap: true
          }
        },
        friend: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            handicap: true
          }
        }
      }
    })

    // Transform the data to show friend information
    const friends = friendships.map(friendship => {
      const isUser = friendship.userId === user.id
      const friend = isUser ? friendship.friend : friendship.user
      const isPending = friendship.status === 'PENDING'
      const isAccepted = friendship.status === 'ACCEPTED'
      
      return {
        id: friendship.id,
        friend: {
          id: friend.id,
          firstName: friend.firstName,
          lastName: friend.lastName,
          email: friend.email,
          handicap: friend.handicap
        },
        status: friendship.status,
        isPending,
        isAccepted,
        isIncoming: !isUser && isPending,
        createdAt: friendship.createdAt
      }
    })

    return NextResponse.json(friends)
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { friendEmail, action, friendshipId } = body

  try {
    if (action === 'send_request') {
      // Find the friend by email
      const friendProfile = await prisma.userProfile.findUnique({
        where: { email: friendEmail }
      })

      if (!friendProfile) {
        return NextResponse.json(
          { error: 'User not found with that email' },
          { status: 404 }
        )
      }

      if (friendProfile.userId === user.id) {
        return NextResponse.json(
          { error: 'Cannot add yourself as a friend' },
          { status: 400 }
        )
      }

      // Check if friendship already exists
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: user.id, friendId: friendProfile.userId },
            { userId: friendProfile.userId, friendId: user.id }
          ]
        }
      })

      if (existingFriendship) {
        return NextResponse.json(
          { error: 'Friendship request already exists' },
          { status: 400 }
        )
      }

      // Create friendship request
      const friendship = await prisma.friendship.create({
        data: {
          userId: user.id,
          friendId: friendProfile.userId,
          status: 'PENDING'
        },
        include: {
          friend: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              handicap: true
            }
          }
        }
      })

      return NextResponse.json(friendship)
    }

    if (action === 'accept') {
      const friendship = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'ACCEPTED' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              handicap: true
            }
          },
          friend: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              handicap: true
            }
          }
        }
      })

      return NextResponse.json(friendship)
    }

    if (action === 'decline') {
      await prisma.friendship.delete({
        where: { id: friendshipId }
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'remove') {
      await prisma.friendship.delete({
        where: { id: friendshipId }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing friendship:', error)
    return NextResponse.json(
      { error: 'Failed to manage friendship' },
      { status: 500 }
    )
  }
}
