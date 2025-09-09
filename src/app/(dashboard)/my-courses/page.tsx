import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

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
  // Get all courses the user has played with stats
  const coursesWithRounds = await prisma.course.findMany({
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
  })

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
}

function CourseCard({ course }: { course: CourseWithStats }) {
  const scoreToPar = course.bestScore ? course.bestScore - course.par : null
  const avgScoreToPar = course.averageScore ? course.averageScore - course.par : null

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{course.name}</CardTitle>
              {course.location && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {course.location}
                </div>
              )}
            </div>
            <Badge variant="outline">Par {course.par}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Rounds Played</div>
              <div className="text-2xl font-bold text-green-600">{course.roundCount}</div>
            </div>
            
            {course.bestScore && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Best Score</div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold">{course.bestScore}</span>
                  {scoreToPar !== null && (
                    <span className={`text-sm flex items-center ${scoreToPar <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {scoreToPar <= 0 ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {scoreToPar > 0 ? '+' : ''}{scoreToPar}
                    </span>
                  )}
                </div>
              </div>
            )}

            {course.averageScore && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Average Score</div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold">{course.averageScore}</span>
                  {avgScoreToPar !== null && (
                    <span className={`text-sm ${avgScoreToPar <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ({avgScoreToPar > 0 ? '+' : ''}{avgScoreToPar})
                    </span>
                  )}
                </div>
              </div>
            )}

            {course.lastPlayed && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Last Played</div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {course.lastPlayed.toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 3h10M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4M9 21h6" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses played yet</h3>
      <p className="text-gray-500 mb-6">Start tracking your rounds to see your course history and statistics.</p>
      <Link
        href="/rounds/new"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Record Your First Round
      </Link>
    </div>
  )
}

async function MyCoursesContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in to view your courses.</div>
  }

  const courses = await getMyCoursesData(user.id)

  if (courses.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">
          Courses you've played with your performance statistics
        </p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <MyCoursesContent />
      </Suspense>
    </div>
  )
}
