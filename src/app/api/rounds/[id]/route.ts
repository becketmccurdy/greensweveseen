import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateRoundSchema = z.object({
  courseId: z.string().uuid(),
  date: z.string().transform((str) => new Date(str)),
  score: z.number().int().min(1).max(300),
  notes: z.string().nullable().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { requireAuth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    
    const user = await requireAuth()
    const roundId = params.id
    const body = await request.json()
    
    const validatedData = updateRoundSchema.parse(body)

    // Verify the round belongs to the user
    const existingRound = await prisma.round.findFirst({
      where: {
        id: roundId,
        userId: user.id
      }
    })

    if (!existingRound) {
      return NextResponse.json(
        { error: 'Round not found or access denied' },
        { status: 404 }
      )
    }

    // Update the round
    const updatedRound = await prisma.round.update({
      where: { id: roundId },
      data: {
        courseId: validatedData.courseId,
        date: validatedData.date,
        totalScore: validatedData.score,
        notes: validatedData.notes,
      },
      include: {
        course: true,
      }
    })

    return NextResponse.json(updatedRound)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating round:', error)
    return NextResponse.json(
      { error: 'Failed to update round' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Dynamic imports to avoid build-time dependency issues
    const { requireAuth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    
    const user = await requireAuth()
    const roundId = params.id

    // Verify the round belongs to the user
    const round = await prisma.round.findFirst({
      where: {
        id: roundId,
        userId: user.id
      }
    })

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the round (scores will be deleted automatically due to cascade)
    await prisma.round.delete({
      where: { id: roundId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting round:', error)
    return NextResponse.json(
      { error: 'Failed to delete round' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { requireAuth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    
    const user = await requireAuth()
    const roundId = params.id

    const round = await prisma.round.findFirst({
      where: {
        id: roundId,
        userId: user.id
      },
      include: {
        course: true,
        scores: {
          orderBy: { hole: 'asc' }
        }
      }
    })

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(round)
  } catch (error) {
    console.error('Error fetching round:', error)
    return NextResponse.json(
      { error: 'Failed to fetch round' },
      { status: 500 }
    )
  }
}
