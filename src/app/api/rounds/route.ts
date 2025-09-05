import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  try {
    const round = await prisma.round.create({
      data: {
        userId: user.id,
        courseId: body.courseId,
        totalScore: body.totalScore,
        totalPar: body.totalPar,
        date: body.date,
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
