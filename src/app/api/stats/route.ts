import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'all' // all, year, month, week

  try {
    // Calculate date range based on period
    const now = new Date()
    let startDate: Date | undefined

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = undefined
    }

    // Get rounds with date filter
    const rounds = await prisma.round.findMany({
      where: {
        userId: user.id,
        ...(startDate && { date: { gte: startDate } })
      },
      include: {
        course: {
          select: {
            name: true,
            par: true
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    if (rounds.length === 0) {
      return NextResponse.json({
        totalRounds: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        handicap: 0,
        coursesPlayed: 0,
        scoreTrend: [],
        scoreDistribution: [],
        monthlyStats: [],
        recentRounds: []
      })
    }

    // Calculate basic stats
    const scores = rounds.map(r => r.totalScore)
    const totalRounds = rounds.length
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const bestScore = Math.min(...scores)
    const worstScore = Math.max(...scores)
    const coursesPlayed = new Set(rounds.map(r => r.courseId)).size

    // Calculate handicap (simplified)
    const handicap = Math.max(0, averageScore - 72)

    // Score trend data for chart
    const scoreTrend = rounds.map(round => ({
      date: round.date.toISOString().split('T')[0],
      score: round.totalScore,
      par: round.course.par,
      course: round.course.name,
      toPar: round.totalScore - round.course.par
    }))

    // Score distribution
    const scoreRanges = [
      { range: 'Under 80', min: 0, max: 79, count: 0 },
      { range: '80-89', min: 80, max: 89, count: 0 },
      { range: '90-99', min: 90, max: 99, count: 0 },
      { range: '100-109', min: 100, max: 109, count: 0 },
      { range: '110+', min: 110, max: 200, count: 0 }
    ]

    scores.forEach(score => {
      const range = scoreRanges.find(r => score >= r.min && score <= r.max)
      if (range) range.count++
    })

    const scoreDistribution = scoreRanges.map(r => ({
      range: r.range,
      count: r.count,
      percentage: Math.round((r.count / totalRounds) * 100)
    }))

    // Monthly stats
    const monthlyStats = rounds.reduce((acc, round) => {
      const month = round.date.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, rounds: 0, totalScore: 0, averageScore: 0 }
      }
      acc[month].rounds++
      acc[month].totalScore += round.totalScore
      acc[month].averageScore = Math.round(acc[month].totalScore / acc[month].rounds)
      return acc
    }, {} as Record<string, { month: string; rounds: number; totalScore: number; averageScore: number }>)

    const monthlyStatsArray = Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month))

    // Recent rounds (last 10)
    const recentRounds = rounds
      .slice(-10)
      .reverse()
      .map(round => ({
        id: round.id,
        date: round.date.toISOString().split('T')[0],
        score: round.totalScore,
        par: round.course.par,
        toPar: round.totalScore - round.course.par,
        course: round.course.name,
        weather: round.weather,
        notes: round.notes
      }))

    return NextResponse.json({
      totalRounds,
      averageScore,
      bestScore,
      worstScore,
      handicap,
      coursesPlayed,
      scoreTrend,
      scoreDistribution,
      monthlyStats: monthlyStatsArray,
      recentRounds
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
