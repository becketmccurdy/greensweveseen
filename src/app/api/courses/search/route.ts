import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getGolfCourseAPIClient } from '@/lib/golf-course-api'

export async function GET(request: NextRequest) {
  try {
    // Auth is optional here: we show public search results and
    // enhance them with play counts only when the user is logged in.
    let userId: string | null = null
    try {
      const supabase = await createClient(request)
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch (e) {
      // Ignore auth errors; proceed as anonymous
      userId = null
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radiusKm = parseFloat(searchParams.get('radiusKm') || '50')

    if (!query || query.length < 2) {
      return NextResponse.json({ courses: [] })
    }

    // Helper function to calculate distance between two points in km
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371 // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    // Check if PostGIS is enabled
    const usePostGIS = process.env.USE_POSTGIS === 'true'
    const userLat = lat ? parseFloat(lat) : null
    const userLng = lng ? parseFloat(lng) : null
    const hasLocation = userLat !== null && userLng !== null

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
      // Search local courses with location bias if available
      let localCoursesQuery: any = {
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 15
      }

      // Add location-based filtering if PostGIS is enabled and location is provided
      if (usePostGIS && hasLocation) {
        // Using PostGIS ST_DWithin for efficient spatial queries
        localCoursesQuery = {
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { location: { contains: query, mode: 'insensitive' } }
                ]
              },
              // Note: This would require raw SQL with PostGIS - simplified for now
              // ST_DWithin would be used here with geography cast
            ]
          },
          take: 15
        }
      } else if (hasLocation) {
        // Fallback: bounding box filter using degree approximation
        const kmToDegree = radiusKm / 111.32 // Rough conversion
        localCoursesQuery.where.AND = [
          localCoursesQuery.where.OR ? { OR: localCoursesQuery.where.OR } : {},
          {
            latitude: {
              gte: userLat - kmToDegree,
              lte: userLat + kmToDegree
            },
            longitude: {
              gte: userLng - kmToDegree,
              lte: userLng + kmToDegree
            }
          }
        ]
        // Remove the OR from the root since it's now in AND
        delete localCoursesQuery.where.OR
      }

      const localCourses = await withTimeout(
        prisma.course.findMany(localCoursesQuery),
        8000 // 8 second timeout
      )

      // Get user's play history for local courses with timeout
      const localCourseIds = localCourses.map(c => c.id)
      let userRounds: any[] = []
      if (userId && localCourseIds.length > 0) {
        try {
          userRounds = await withTimeout(
            prisma.round.groupBy({
              by: ['courseId'],
              where: {
                userId: userId,
                courseId: { in: localCourseIds }
              },
              _count: { id: true }
            } as any),
            5000
          )
        } catch (roundsError) {
          console.warn('Failed to get user rounds history:', roundsError)
        }
      }

    // Create a map of course play counts
    const playCountMap = new Map(userRounds.map(r => [r.courseId, r._count.id]))

    // Add play counts and distance to local courses
    const localCoursesWithPlayCount = localCourses.map(course => {
      const courseData: any = {
        ...course,
        timesPlayed: playCountMap.get(course.id) || 0,
        source: 'local' as const
      }

      // Add distance if user location is available
      if (hasLocation && course.latitude && course.longitude) {
        courseData.distance_km = calculateDistance(userLat!, userLng!, course.latitude, course.longitude)
      }

      return courseData
    })

    // Search external API to provide more course options
    let externalCourses: any[] = []
    const golfAPI = getGolfCourseAPIClient()
    if (golfAPI) {
      try {
        const apiCourses = await golfAPI.searchCourses(query)
        externalCourses = apiCourses.slice(0, 15).map(course => {
          const courseData: any = {
            id: `external-${course.id}`,
            name: course.course_name || course.club_name,
            location: course.location.city && course.location.state
              ? `${course.location.city}, ${course.location.state}`
              : course.location.address || 'Location unavailable',
            par: course.tees.male?.[0]?.par_total || course.tees.female?.[0]?.par_total || 72,
            timesPlayed: 0,
            source: 'external' as const,
            externalId: course.id,
            latitude: course.location.latitude,
            longitude: course.location.longitude,
            address: course.location.address
          }

          // Add distance if user location is available
          if (hasLocation && course.location.latitude && course.location.longitude) {
            courseData.distance_km = calculateDistance(
              userLat!, userLng!,
              course.location.latitude,
              course.location.longitude
            )
          }

          return courseData
        })

        console.log(`Found ${apiCourses.length} external courses for query: ${query}`)
      } catch (error) {
        console.error('External API search error:', error)
      }
    }

    // Deduplicate courses by name and location proximity
    const allCourses = [...localCoursesWithPlayCount, ...externalCourses]
    const deduplicatedCourses: any[] = []
    const seen = new Set<string>()

    for (const course of allCourses) {
      const normalizedName = course.name.toLowerCase().trim()
      let isDuplicate = false

      // Check for duplicates by name and proximity
      for (const existing of deduplicatedCourses) {
        const existingNormalizedName = existing.name.toLowerCase().trim()

        // Same name or very similar name
        if (normalizedName === existingNormalizedName ||
            normalizedName.includes(existingNormalizedName) ||
            existingNormalizedName.includes(normalizedName)) {

          // Check proximity if both have coordinates
          if (course.latitude && course.longitude &&
              existing.latitude && existing.longitude) {
            const distance = calculateDistance(
              course.latitude, course.longitude,
              existing.latitude, existing.longitude
            )

            // Within 400m - likely the same course
            if (distance < 0.4) {
              isDuplicate = true
              // Prefer local over external
              if (course.source === 'local' && existing.source === 'external') {
                // Replace external with local
                const index = deduplicatedCourses.indexOf(existing)
                deduplicatedCourses[index] = course
              }
              break
            }
          } else {
            // No coordinates, assume duplicate based on name
            isDuplicate = true
            if (course.source === 'local' && existing.source === 'external') {
              const index = deduplicatedCourses.indexOf(existing)
              deduplicatedCourses[index] = course
            }
            break
          }
        }
      }

      if (!isDuplicate) {
        deduplicatedCourses.push(course)
      }
    }

    // Enhanced ranking heuristic
    deduplicatedCourses.sort((a, b) => {
      // 1. Exact/startsWith match on course name (case-insensitive)
      const aExactMatch = a.name.toLowerCase().startsWith(query.toLowerCase())
      const bExactMatch = b.name.toLowerCase().startsWith(query.toLowerCase())
      if (aExactMatch && !bExactMatch) return -1
      if (!aExactMatch && bExactMatch) return 1

      // 2. Times played (user history)
      if (a.timesPlayed > 0 && b.timesPlayed === 0) return -1
      if (a.timesPlayed === 0 && b.timesPlayed > 0) return 1
      if (a.timesPlayed !== b.timesPlayed) return b.timesPlayed - a.timesPlayed

      // 3. Distance (if available)
      if (hasLocation && a.distance_km !== undefined && b.distance_km !== undefined) {
        if (a.distance_km !== b.distance_km) return a.distance_km - b.distance_km
      }

      // 4. Source priority (local before external)
      if (a.source === 'local' && b.source === 'external') return -1
      if (a.source === 'external' && b.source === 'local') return 1

      // 5. Alphabetical by name
      return a.name.localeCompare(b.name)
    })

    // Return at most 25 results
    const finalResults = deduplicatedCourses.slice(0, 25)

      return NextResponse.json({ courses: finalResults })
    } catch (localError) {
      console.error('Local course search failed:', localError)
      
      // Fallback: try to get external courses only
      try {
        const golfAPI = getGolfCourseAPIClient()
        if (golfAPI) {
          const apiCourses = await golfAPI.searchCourses(query)
          const externalCourses = apiCourses.slice(0, 15).map(course => {
            const courseData: any = {
              id: `external-${course.id}`,
              name: course.course_name || course.club_name,
              location: course.location.city && course.location.state
                ? `${course.location.city}, ${course.location.state}`
                : course.location.address || 'Location unavailable',
              par: course.tees.male?.[0]?.par_total || course.tees.female?.[0]?.par_total || 72,
              timesPlayed: 0,
              source: 'external' as const,
              externalId: course.id,
              latitude: course.location.latitude,
              longitude: course.location.longitude,
              address: course.location.address
            }

            // Add distance if user location is available
            if (hasLocation && course.location.latitude && course.location.longitude) {
              courseData.distance_km = calculateDistance(
                userLat!, userLng!,
                course.location.latitude,
                course.location.longitude
              )
            }

            return courseData
          })

          console.log(`Fallback search found ${apiCourses.length} external courses for query: ${query}`)
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
