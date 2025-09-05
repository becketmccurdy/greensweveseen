import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Bulk upsert scores for a round the current user owns
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { roundId, scores } = body as { roundId?: string; scores?: Array<{ hole: number; strokes: number; par: number; putts?: number | null; fairway?: boolean | null; gir?: boolean | null; notes?: string | null }> }

  if (!roundId || !Array.isArray(scores)) {
    return NextResponse.json({ error: 'roundId and scores[] required' }, { status: 400 })
  }

  try {
    const round = await prisma.round.findUnique({ where: { id: roundId } })
    if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    if (round.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Upsert each score, enforce unique (roundId, hole)
    await prisma.$transaction(
      scores.map((s) =>
        prisma.score.upsert({
          where: { roundId_hole: { roundId, hole: s.hole } },
          create: {
            roundId,
            userId: user.id,
            hole: s.hole,
            strokes: s.strokes,
            par: s.par,
            putts: s.putts ?? null,
            fairway: s.fairway ?? null,
            gir: s.gir ?? null,
            notes: s.notes ?? null,
          },
          update: {
            strokes: s.strokes,
            par: s.par,
            putts: s.putts ?? null,
            fairway: s.fairway ?? null,
            gir: s.gir ?? null,
            notes: s.notes ?? null,
          },
        })
      )
    )

    // Recalculate round totals
    const saved = await prisma.score.findMany({ where: { roundId } })
    const totalScore = saved.reduce((a, b) => a + b.strokes, 0)
    const totalPar = saved.reduce((a, b) => a + b.par, 0)
    await prisma.round.update({ where: { id: roundId }, data: { totalScore, totalPar } })

    return NextResponse.json({ success: true, totalScore, totalPar })
  } catch (error) {
    console.error('Error saving scores:', error)
    return NextResponse.json({ error: 'Failed to save scores' }, { status: 500 })
  }
}
