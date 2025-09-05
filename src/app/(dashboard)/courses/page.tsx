'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/auth-context'
import { getCourses } from '../../../lib/firestore'
import { CourseList, type CourseListItem } from '../../../components/courses/course-list'
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
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState(null)

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
      
      // Transform to CourseListItem format with rounds count
      const courseList: CourseListItem[] = coursesData.map(course => ({
        id: course.id || '',
        name: course.name,
        location: course.location,
        par: course.par,
        roundsCount: 0 // TODO: Calculate from rounds data
      }))
      
      setCourses(courseList)
    } catch (error) {
      setError(error)
      console.error('Error loading courses:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const fallbackRender = ({ error, resetErrorBoundary }: FallbackProps) => (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-red-600">Failed to load courses: {error.message}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={resetErrorBoundary}
      >
        Try Again
      </Button>
    </div>
  )

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Courses</h1>
          <p className="text-gray-600">Courses you've played at least once</p>
        </div>
        
        <ErrorBoundary fallbackRender={fallbackRender}>
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          }>
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
              <CourseList courses={courses} />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
