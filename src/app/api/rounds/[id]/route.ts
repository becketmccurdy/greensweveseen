import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRoundSchema = z.object({
  score: z.number().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  courseId: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const round = await prisma.round.findUnique({
      where: { 
        id: params.id,
        userId: user.id // Ensure user can only access their own rounds
      },
      include: {
        course: true,
        scores: true
      }
    })

    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    return NextResponse.json(round)
  } catch (error) {
    console.error('Error fetching round:', error)
    return NextResponse.json({ error: 'Failed to fetch round' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateRoundSchema.parse(body)

    // Verify the round belongs to the user
    const existingRound = await prisma.round.findUnique({
      where: { 
        id: params.id,
        userId: user.id
      }
    })

    if (!existingRound) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    const updateData: any = {
      totalScore: validatedData.score,
      date: new Date(validatedData.date),
    }
    
    if (validatedData.courseId) {
      updateData.courseId = validatedData.courseId
    }
    
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes
    }

    const updatedRound = await prisma.round.update({
      where: { id: params.id },
      data: updateData,
      include: {
        course: true,
        scores: true
      }
    })

    return NextResponse.json(updatedRound)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    console.error('Error updating round:', error)
    return NextResponse.json({ error: 'Failed to update round' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify the round belongs to the user
    const existingRound = await prisma.round.findUnique({
      where: { 
        id: params.id,
        userId: user.id
      }
    })

    if (!existingRound) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    // Delete associated scores first (if any)
    await prisma.score.deleteMany({
      where: { roundId: params.id }
    })

    // Delete the round
    await prisma.round.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting round:', error)
    return NextResponse.json({ error: 'Failed to delete round' }, { status: 500 })
  }
}
