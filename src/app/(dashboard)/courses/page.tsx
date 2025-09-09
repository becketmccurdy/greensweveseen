import { Suspense } from 'react'
import { CoursesDirectory } from '@/components/courses/courses-directory'
import { CoursesGridSkeleton } from '@/components/courses/courses-skeleton'
import { getUserProfile } from '@/lib/auth'

interface CoursesPageProps {
  searchParams: Promise<{ 
    q?: string
    distance?: string
    sort?: string
    view?: string
    lat?: string
    lng?: string
  }>
}

async function getInitialCourses(searchParams: { 
  q?: string
  distance?: string
  sort?: string
  view?: string
  lat?: string
  lng?: string
}) {
  try {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.lat && searchParams.lng && searchParams.distance) {
      params.set('lat', searchParams.lat)
      params.set('lng', searchParams.lng)
      params.set('distance', searchParams.distance)
    }
    if (searchParams.sort) params.set('sort', searchParams.sort)
    params.set('limit', '100')

    // For server-side rendering, we would normally fetch from our API
    // But since we're in a server component and need auth, we'll skip initial data
    // and let the client component handle the fetch
    return []
  } catch (error) {
    console.error('Error fetching initial courses:', error)
    return []
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const profile = await getUserProfile()
  const resolvedSearchParams = await searchParams
  const initialCourses = await getInitialCourses(resolvedSearchParams)

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses Directory</h1>
        <p className="text-muted-foreground">
          Discover golf courses near you or search the global directory
        </p>
      </div>

      <Suspense fallback={<CoursesGridSkeleton />}>
        <CoursesDirectory
          initialCourses={initialCourses}
          initialSearchQuery={resolvedSearchParams.q || ''}
          initialViewMode={resolvedSearchParams.view === 'map' ? 'map' : 'grid'}
        />
      </Suspense>
    </div>
  )
}
