'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Course = {
  id: string
  name: string
  location: string | null
  par: number
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses')
        if (!response.ok) throw new Error('Failed to fetch courses')
        const data: Course[] = await response.json()
        setCourses(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    fetchCourses()
  }, [])

  if (error) throw error
  if (!courses) return null

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle>{course.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Location: {course.location || 'N/A'}</p>
            <p>Par: {course.par}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
