import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
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

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
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

    const round = await prisma.round.create({
      data: {
        userId: user.id,
        courseId: body.courseId,
        totalScore: body.totalScore,
        totalPar: body.totalPar,
        date: body.date ? new Date(body.date) : new Date(),
        weather: body.weather,
        notes: body.notes,
      }
    })

    return NextResponse.json(round)
  } catch (error) {
    console.error('Error creating round:', error)
    return NextResponse.json(
      { error: 'Failed to create round' },
      { status: 500 }
    )
  }
}
