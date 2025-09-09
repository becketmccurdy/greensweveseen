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
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ courses: [] })
  }

  try {
    // Search all courses with fuzzy matching
    const allCourses = await prisma.course.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: 10
    })

    // Get user's play history for these courses
    const courseIds = allCourses.map(c => c.id)
    const userRounds = await prisma.round.groupBy({
      by: ['courseId'],
      where: {
        userId: user.id,
        courseId: { in: courseIds }
      },
      _count: {
        id: true
      }
    })

    // Create a map of course play counts
    const playCountMap = new Map(
      userRounds.map(r => [r.courseId, r._count.id])
    )

    // Add play counts to courses
    const coursesWithPlayCount = allCourses.map(course => ({
      ...course,
      timesPlayed: playCountMap.get(course.id) || 0
    }))

    // Sort by: courses played by user first, then alphabetically
    coursesWithPlayCount.sort((a, b) => {
      if (a.timesPlayed > 0 && b.timesPlayed === 0) return -1
      if (a.timesPlayed === 0 && b.timesPlayed > 0) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({ courses: coursesWithPlayCount })
  } catch (error) {
    console.error('Course search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
