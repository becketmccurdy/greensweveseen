import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface CourseWithStats {
  id: string
  name: string
  location: string | null
  par: number
  roundCount: number
  bestScore: number | null
  averageScore: number | null
  lastPlayed: Date | null
}

async function getMyCoursesData(userId: string): Promise<CourseWithStats[]> {
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
    // Get all courses the user has played with stats
    const coursesWithRounds = await withTimeout(
      prisma.course.findMany({
        where: {
          rounds: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          rounds: {
            where: {
              userId: userId
            },
            select: {
              totalScore: true,
              date: true
            },
            orderBy: {
              date: 'desc'
            }
          }
        }
      }),
      10000 // 10 second timeout
    )

    return coursesWithRounds.map(course => {
      const scores = course.rounds.map(r => r.totalScore)
      const bestScore = scores.length > 0 ? Math.min(...scores) : null
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
      const lastPlayed = course.rounds.length > 0 ? course.rounds[0]?.date || null : null

      return {
        id: course.id,
        name: course.name,
        location: course.location,
        par: course.par,
        roundCount: course.rounds.length,
        bestScore,
        averageScore,
        lastPlayed
      }
    }).sort((a, b) => {
      // Sort by last played date (most recent first)
      if (!a.lastPlayed && !b.lastPlayed) return 0
      if (!a.lastPlayed) return 1
      if (!b.lastPlayed) return -1
      return b.lastPlayed.getTime() - a.lastPlayed.getTime()
    })
  } catch (error) {
    console.error('Error fetching my courses data:', error)
    // Return empty array instead of throwing to prevent 500 errors
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await getMyCoursesData(user.id)
    
    // Convert dates to ISO strings for JSON serialization
    const serializedCourses = courses.map(course => ({
      ...course,
      lastPlayed: course.lastPlayed ? course.lastPlayed.toISOString() : null
    }))

    return NextResponse.json(serializedCourses)
  } catch (error) {
    console.error('Error in my-courses API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch your courses' },
      { status: 500 }
    )
  }
}