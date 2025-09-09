'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, X } from 'lucide-react'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface Course {
  id: string
  name: string
  location: string | null
  par: number
  latitude: number | null
  longitude: number | null
  distance_km?: number | null
  owned?: boolean
}

interface CoursesMapViewProps {
  courses: Course[]
  userLocation: { lat: number; lng: number } | null
  onCourseSelect?: (course: Course) => void
}

export function CoursesMapView({ courses, userLocation, onCourseSelect }: CoursesMapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [-98.5, 39.5], // Default to center of US
      zoom: userLocation ? 10 : 4,
    })

    mapRef.current = map

    // Add controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right')

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [userLocation])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !courses.length) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Filter courses with valid coordinates
    const validCourses = courses.filter(course => 
      course.latitude != null && course.longitude != null
    )

    if (validCourses.length === 0) return

    const markers: mapboxgl.Marker[] = []

    // Add course markers
    validCourses.forEach((course) => {
      if (course.latitude == null || course.longitude == null) return

      // Create marker element
      const el = document.createElement('div')
      el.className = `cursor-pointer transition-transform hover:scale-110 ${
        course.owned ? 'text-green-600' : 'text-blue-600'
      }`
      el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `

      // Create popup content
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-2 min-w-[200px]">
          <h3 class="font-semibold text-sm">${course.name}</h3>
          <p class="text-xs text-gray-600">${course.location || 'No location'}</p>
          <p class="text-xs text-gray-600">Par ${course.par}</p>
          ${course.distance_km ? `<p class="text-xs text-gray-600">${course.distance_km.toFixed(1)} km away</p>` : ''}
          ${course.owned ? '<p class="text-xs text-green-600">Your course</p>' : ''}
        </div>
      `)

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([course.longitude, course.latitude])
        .setPopup(popup)
        .addTo(map)

      // Add click and keyboard handlers for accessibility
      el.addEventListener('click', () => {
        setSelectedCourse(course)
        onCourseSelect?.(course)
      })
      
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setSelectedCourse(course)
          onCourseSelect?.(course)
        }
      })
      
      // Make focusable and add ARIA attributes
      el.setAttribute('tabindex', '0')
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', `Select ${course.name} golf course`)
      el.setAttribute('aria-describedby', `course-${course.id}-details`)

      markers.push(marker)
    })

    markersRef.current = markers

    // Fit map to show all courses if we have multiple
    if (validCourses.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      validCourses.forEach(course => {
        if (course.latitude != null && course.longitude != null) {
          bounds.extend([course.longitude, course.latitude])
        }
      })
      
      // Add user location to bounds if available
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat])
      }

      map.fitBounds(bounds, { 
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15
      })
    } else if (validCourses.length === 1) {
      const course = validCourses[0]
      if (course && course.latitude != null && course.longitude != null) {
        map.setCenter([course.longitude, course.latitude])
        map.setZoom(14)
      }
    }

  }, [courses, onCourseSelect, userLocation])

  // Add user location marker
  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLocation) return

    const userEl = document.createElement('div')
    userEl.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg'
    
    const userMarker = new mapboxgl.Marker(userEl)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map)

    return () => {
      userMarker.remove()
    }
  }, [userLocation])

  const validCoursesCount = courses.filter(c => c.latitude != null && c.longitude != null).length

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[600px] rounded-lg overflow-hidden border"
      />

      {/* Course Details Card */}
      {selectedCourse && (
        <Card className="absolute top-4 left-4 w-80 z-10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedCourse.name}</h3>
                {selectedCourse.location && (
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCourse.location}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">Par {selectedCourse.par}</Badge>
                  {selectedCourse.owned && (
                    <Badge variant="default">Your Course</Badge>
                  )}
                  {selectedCourse.distance_km && (
                    <Badge variant="outline">
                      {selectedCourse.distance_km.toFixed(1)} km away
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCourse(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Stats */}
      <div className="absolute bottom-4 left-4 z-10">
        <Badge variant="secondary">
          {validCoursesCount} course{validCoursesCount !== 1 ? 's' : ''} on map
        </Badge>
      </div>

      {/* Center on User Button */}
      {userLocation && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 z-10"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 12
              })
            }
          }}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Center on Me
        </Button>
      )}
    </div>
  )
}