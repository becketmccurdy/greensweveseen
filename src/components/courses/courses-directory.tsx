'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CoursesFilters } from './courses-filters'
import { CoursesGridView } from './courses-grid-view'
import { CoursesMapView } from './courses-map-view'
import { CoursesGridSkeleton, CoursesMapSkeleton, CoursesFiltersSkeleton } from './courses-skeleton'
import { toast } from 'sonner'

interface Course {
  id: string
  name: string
  location: string | null
  par: number
  latitude: number | null
  longitude: number | null
  distance_km?: number | null
  owned?: boolean
  rating?: number | null
  slope?: number | null
  holes?: number | null
}

interface CoursesDirectoryProps {
  initialCourses?: Course[]
  initialSearchQuery?: string
  initialViewMode?: 'grid' | 'map'
}

export function CoursesDirectory({ 
  initialCourses = [], 
  initialSearchQuery = '',
  initialViewMode = 'grid'
}: CoursesDirectoryProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // State
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [distance, setDistance] = useState(25) // km
  const [sort, setSort] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>(initialViewMode)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Update URL params when filters change
  const updateURLParams = useCallback((params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })

    router.push(`?${newSearchParams.toString()}`, { scroll: false })
  }, [searchParams, router])

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (userLocation && distance) {
        params.set('lat', userLocation.lat.toString())
        params.set('lng', userLocation.lng.toString())
        params.set('distance', distance.toString())
      }
      if (sort) params.set('sort', sort)
      params.set('limit', '100')

      const response = await fetch(`/api/courses?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const data = await response.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, userLocation, distance, sort])

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        toast.success('Location updated successfully')
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Failed to get your location')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  // Handle search query change with debouncing
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      updateURLParams({ q: query })
    }, 500)
    
    setSearchTimeout(timeout)
  }, [searchTimeout, updateURLParams])

  // Handle other filter changes
  const handleDistanceChange = useCallback((newDistance: number) => {
    setDistance(newDistance)
    updateURLParams({ distance: newDistance.toString() })
  }, [updateURLParams])

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort)
    updateURLParams({ sort: newSort })
  }, [updateURLParams])

  const handleViewModeChange = useCallback((mode: 'grid' | 'map') => {
    setViewMode(mode)
    updateURLParams({ view: mode })
  }, [updateURLParams])

  // Initialize from URL params
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const d = searchParams.get('distance') || '25'
    const s = searchParams.get('sort') || 'name'
    const v = searchParams.get('view') || 'grid'

    setSearchQuery(q)
    setDistance(parseInt(d))
    setSort(s)
    setViewMode(v as 'grid' | 'map')
  }, [searchParams])

  // Fetch courses when dependencies change
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const handleCourseEdit = useCallback(async (course: Course) => {
    // This would typically open an edit dialog
    toast.info('Course editing functionality would open here')
  }, [])

  const handleCourseDelete = useCallback(async (course: Course) => {
    if (!confirm(`Delete ${course.name}? This cannot be undone.`)) return
    
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete course')
      }
      
      setCourses(prev => prev.filter(c => c.id !== course.id))
      toast.success('Course deleted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete course')
    }
  }, [])

  const handleCourseSelect = useCallback((course: Course) => {
    toast.info(`Selected: ${course.name}`)
  }, [])

  if (error && !loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <div className="text-red-500 text-xl">⚠</div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading courses</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-4">{error}</p>
        <button
          onClick={fetchCourses}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {loading && courses.length === 0 ? (
        <CoursesFiltersSkeleton />
      ) : (
        <CoursesFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          distance={distance}
          onDistanceChange={handleDistanceChange}
          sort={sort}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          userLocation={userLocation}
          onGetLocation={getUserLocation}
          loading={loading}
        />
      )}

      {/* Content */}
      {loading && courses.length === 0 ? (
        viewMode === 'grid' ? <CoursesGridSkeleton /> : <CoursesMapSkeleton />
      ) : viewMode === 'grid' ? (
        <CoursesGridView
          courses={courses}
          onEdit={handleCourseEdit}
          onDelete={handleCourseDelete}
          onSelect={handleCourseSelect}
        />
      ) : (
        <CoursesMapView
          courses={courses}
          userLocation={userLocation}
          onCourseSelect={handleCourseSelect}
        />
      )}

      {/* Loading overlay for subsequent fetches */}
      {loading && courses.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating courses...
          </div>
        </div>
      )}
    </div>
  )
}