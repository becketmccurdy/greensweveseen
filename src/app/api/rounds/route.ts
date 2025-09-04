import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createRoundSchema = z.object({
  courseId: z.string().uuid(),
  date: z.string().transform((str) => new Date(str)),
  score: z.number().int().min(1).max(300),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time dependency issues
    const { requireAuth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    
    const user = await requireAuth()
    const body = await request.json()
    
    const validatedData = createRoundSchema.parse(body)
    
    const round = await prisma.round.create({
      data: {
        userId: user.id,
        courseId: validatedData.courseId,
        date: validatedData.date,
        totalScore: validatedData.score,
        notes: validatedData.notes,
      },
      include: {
        course: true,
      }
    })
    
    return NextResponse.json(round, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating round:', error)
    return NextResponse.json(
      { error: 'Failed to create round' },
      { status: 500 }
    )
  }
}
