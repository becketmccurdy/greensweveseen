'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { getCourses } from '@/lib/firestore'
import { CourseList, type CourseListItem } from '@/components/courses/course-list'
import { EmptyCourses } from '@/components/dashboard/empty-states'

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
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Courses</h1>
        <p className="text-gray-600">Courses you've played at least once</p>
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading your courses...</div>
        </div>
      ) : courses.length === 0 ? (
        <EmptyCourses />
      ) : (
        <CourseList courses={courses} />
      )}
    </div>
  )
}
