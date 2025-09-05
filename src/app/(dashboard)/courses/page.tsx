'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/auth-context'
import { getCourses } from '../../../lib/firestore'
import { CoursesList } from '@/components/courses/courses-list'
import { EmptyCourses } from '../../../components/dashboard/empty-states'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import type { FallbackProps } from 'react-error-boundary'

interface Course {
  id: string
  name: string
  location: string | null
  par: number
}

export default function CoursesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    if (!user) return
    
    try {
      setDataLoading(true)
      const coursesData = await getCourses(user.uid)
      
      // Transform to Course format
      const courseList: Course[] = coursesData.map(course => ({
        id: course.id || '',
        name: course.name,
        location: course.location,
        par: course.par,
      }))
      
      setCourses(courseList)
    } catch (error) {
      setError(error)
      console.error('Error loading courses:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground">
          View and manage your golf courses
        </p>
      </div>

      <ErrorBoundary 
        fallbackRender={({ error, resetErrorBoundary }) => {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
          return (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <h3 className="text-lg font-medium text-destructive">
                  Failed to load courses
                </h3>
                <p className="text-sm text-destructive">
                  {errorMessage}
                </p>
                <button
                  onClick={() => resetErrorBoundary()}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )
        }}
      >
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          {dataLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Loading your courses...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Error loading courses: {error.message}</div>
            </div>
          ) : courses.length === 0 ? (
            <EmptyCourses />
          ) : (
            <CoursesList courses={courses} />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
