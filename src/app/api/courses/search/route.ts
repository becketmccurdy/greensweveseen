import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getGolfCourseAPIClient } from '@/lib/golf-course-api'

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
    // Search local courses first
    const localCourses = await prisma.course.findMany({
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

    // Get user's play history for local courses
    const localCourseIds = localCourses.map(c => c.id)
    const userRounds = await prisma.round.groupBy({
      by: ['courseId'],
      where: {
        userId: user.id,
        courseId: { in: localCourseIds }
      },
      _count: {
        id: true
      }
    })

    // Create a map of course play counts
    const playCountMap = new Map(
      userRounds.map(r => [r.courseId, r._count.id])
    )

    // Add play counts to local courses
    const localCoursesWithPlayCount = localCourses.map(course => ({
      ...course,
      timesPlayed: playCountMap.get(course.id) || 0,
      source: 'local' as const
    }))

    // Search external API if we have fewer than 5 local results
    let externalCourses: any[] = []
    if (localCourses.length < 5) {
      const golfAPI = getGolfCourseAPIClient()
      if (golfAPI) {
        try {
          const apiCourses = await golfAPI.searchCourses(query)
          externalCourses = apiCourses.slice(0, 10 - localCourses.length).map(course => ({
            id: `external-${course.id}`,
            name: course.course_name || course.club_name,
            location: `${course.location.city}, ${course.location.state}`,
            par: course.tees.male?.[0]?.par_total || course.tees.female?.[0]?.par_total || 72,
            timesPlayed: 0,
            source: 'external' as const,
            externalId: course.id,
            latitude: course.location.latitude,
            longitude: course.location.longitude,
            address: course.location.address
          }))
        } catch (error) {
          console.error('External API search error:', error)
        }
      }
    }

    // Combine and sort results
    const allCourses = [...localCoursesWithPlayCount, ...externalCourses]
    
    // Sort by: courses played by user first, then local courses, then alphabetically
    allCourses.sort((a, b) => {
      if (a.timesPlayed > 0 && b.timesPlayed === 0) return -1
      if (a.timesPlayed === 0 && b.timesPlayed > 0) return 1
      if (a.source === 'local' && b.source === 'external') return -1
      if (a.source === 'external' && b.source === 'local') return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({ courses: allCourses })
  } catch (error) {
    console.error('Course search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
