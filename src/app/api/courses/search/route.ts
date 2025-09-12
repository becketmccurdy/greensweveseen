import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getGolfCourseAPIClient } from '@/lib/golf-course-api'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.warn('Auth error in course search:', authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ courses: [] })
    }

    // Add timeout wrapper for database operations
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), ms)
        )
      ])
    }

    try {
      // Search local courses first with timeout
      const localCourses = await withTimeout(
        prisma.course.findMany({
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
        }),
        8000 // 8 second timeout
      )

      // Get user's play history for local courses with timeout
      const localCourseIds = localCourses.map(c => c.id)
      let userRounds: any[] = []
      
      if (localCourseIds.length > 0) {
        try {
          userRounds = await withTimeout(
            prisma.round.groupBy({
              by: ['courseId'],
              where: {
                userId: user.id,
                courseId: { in: localCourseIds }
              },
              _count: {
                id: true
              }
            } as any),
            5000 // 5 second timeout for rounds query
          )
        } catch (roundsError) {
          console.warn('Failed to get user rounds history:', roundsError)
          // Continue without play counts
        }
      }

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
    } catch (localError) {
      console.error('Local course search failed:', localError)
      
      // Fallback: try to get external courses only
      try {
        const golfAPI = getGolfCourseAPIClient()
        if (golfAPI) {
          const apiCourses = await golfAPI.searchCourses(query)
          const externalCourses = apiCourses.slice(0, 10).map(course => ({
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
          
          return NextResponse.json({ courses: externalCourses })
        }
      } catch (externalError) {
        console.error('External course search also failed:', externalError)
      }
      
      // If everything fails, return empty array instead of error
      return NextResponse.json({ courses: [] })
    }
  } catch (error) {
    console.error('Course search error:', error)
    return NextResponse.json({ courses: [] }) // Return empty array instead of 500
  }
}
