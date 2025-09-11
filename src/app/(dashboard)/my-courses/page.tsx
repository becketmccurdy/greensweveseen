import { MyCoursesClient } from '@/components/courses/my-courses-client'

// Ensure this page is rendered dynamically at request time to avoid static export
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">
          Courses you've played with your performance statistics
        </p>
      </div>

      <MyCoursesClient />
    </div>
  )
}
