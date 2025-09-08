import { Suspense } from 'react'
import { CoursesList } from '@/components/courses/courses-list'
import { getUserProfile } from '@/lib/auth'

export default async function CoursesPage() {
  const profile = await getUserProfile()

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground">
          View and manage your golf courses
        </p>
      </div>

      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-gray-200 rounded-lg" />}>
        <CoursesList />
      </Suspense>
    </div>
  )
}
