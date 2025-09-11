'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface CourseWithStats {
  id: string
  name: string
  location: string | null
  par: number
  roundCount: number
  bestScore: number | null
  averageScore: number | null
  lastPlayed: string | null // ISO string from API
}

function CourseCard({ course }: { course: CourseWithStats }) {
  const scoreToPar = course.bestScore ? course.bestScore - course.par : null
  const avgScoreToPar = course.averageScore ? course.averageScore - course.par : null
  const lastPlayed = course.lastPlayed ? new Date(course.lastPlayed) : null

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

            {lastPlayed && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Last Played</div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {lastPlayed.toLocaleDateString()}
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="text-red-400 mb-4">
        <AlertTriangle className="mx-auto h-12 w-12" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load courses</h3>
      <p className="text-gray-500 mb-6">There was an error loading your course data. Please try again.</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Try Again
      </button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
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
  )
}

export function MyCoursesClient() {
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyCourses = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/my-courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      
      const data = await response.json()
      setCourses(data)
    } catch (err) {
      console.error('Error fetching my courses:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to load your courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyCourses()
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState onRetry={fetchMyCourses} />
  }

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