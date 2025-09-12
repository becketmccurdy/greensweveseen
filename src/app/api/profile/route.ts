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
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      // Create profile if it doesn't exist
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          email: user.email || '',
          firstName: null,
          lastName: null,
          bio: null,
          location: null,
          handicap: null
        }
      })
      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { firstName, lastName, bio, location, handicap } = body

  try {
    // Validate handicap if provided
    if (handicap !== null && handicap !== undefined) {
      if (typeof handicap !== 'number' || handicap < 0 || handicap > 54) {
        return NextResponse.json(
          { error: 'Handicap must be a number between 0 and 54' },
          { status: 400 }
        )
      }
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        bio: bio || null,
        location: location || null,
        handicap: handicap || null
      },
      create: {
        userId: user.id,
        email: user.email || '',
        firstName: firstName || null,
        lastName: lastName || null,
        bio: bio || null,
        location: location || null,
        handicap: handicap || null
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
