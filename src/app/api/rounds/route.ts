import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRoundSchema = z.object({
  courseId: z.string(),
  totalScore: z.number().min(50).max(150),
  totalPar: z.number().min(60).max(80),
  date: z.string().transform((str) => new Date(str)),
  weather: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const profile = await getUserProfile()
    const body = await request.json()
    const data = createRoundSchema.parse(body)

    const round = await prisma.round.create({
      data: {
        userId: profile.userId,
        courseId: data.courseId,
        totalScore: data.totalScore,
        totalPar: data.totalPar,
        date: data.date,
        weather: data.weather,
        notes: data.notes,
      },
      include: {
        course: true,
      },
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
