"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export type MapCourse = {
  id?: string
  name: string
  location?: string | null
  latitude: number
  longitude: number
  par?: number
  source?: 'local' | 'external' | 'mapbox'
  externalId?: number | string
  timesPlayed?: number
  distance_km?: number
}

interface MapCoursePickerProps {
  onSelect: (course: MapCourse) => void
  onClose?: () => void
  height?: number
  showClose?: boolean
}

export default function MapCoursePicker({ onSelect, onClose, height = 360, showClose = true }: MapCoursePickerProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [center, setCenter] = useState<[number, number]>([-122.4194, 37.7749])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<MapCourse[]>([])
  const [dbNearby, setDbNearby] = useState<MapCourse[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchTimeoutId, setSearchTimeoutId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 11,
    })
    mapRef.current = map

    map.on('load', () => {
      // Try geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const c: [number, number] = [pos.coords.longitude, pos.coords.latitude]
            setCenter(c)
            map.setCenter(c)
            fetchDbNearby(c)
          },
          () => fetchDbNearby(center)
        )
      } else {
        fetchDbNearby(center)
      }
    })

    map.on('moveend', () => {
      const c = map.getCenter()
      const coords: [number, number] = [c.lng, c.lat]
      setCenter(coords)
      fetchDbNearby(coords)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutId) {
        clearTimeout(searchTimeoutId)
      }
    }
  }, [searchTimeoutId])

  useEffect(() => {
    // Render DB markers
    const map = mapRef.current
    if (!map) return

    // Remove existing markers by storing them on window (simple cleanup pattern)
    ;(window as any).__dbMarkers?.forEach((m: mapboxgl.Marker) => m.remove())
    const markers: mapboxgl.Marker[] = []

    dbNearby.forEach((c) => {
      const el = document.createElement('div')
      el.className = 'rounded-full bg-green-600 w-3 h-3 border-2 border-white shadow'
      const m = new mapboxgl.Marker(el).setLngLat([c.longitude, c.latitude]).addTo(map)
      m.getElement().title = c.name
      m.getElement().style.cursor = 'pointer'
      m.getElement().addEventListener('click', () => onSelect(c))
      markers.push(m)
    })

    ;(window as any).__dbMarkers = markers
  }, [dbNearby, onSelect])

  const fetchDbNearby = async (coords: [number, number]) => {
    try {
      const r = await fetch(`/api/courses/nearby?lat=${coords[1]}&lng=${coords[0]}&radius=25000`)
      if (r.ok) {
        const json = await r.json()
        const shaped: MapCourse[] = json
          .filter((x: any) => typeof x.latitude === 'number' && typeof x.longitude === 'number')
          .map((x: any) => ({ id: x.id, name: x.name, location: x.location, latitude: x.latitude, longitude: x.longitude, par: x.par }))
        setDbNearby(shaped)
      }
    } catch (e) {
      console.error('Failed to load nearby courses:', e)
    }
  }

  const searchCourses = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    setSearchLoading(true)
    try {
      // Primary search: use our server-side Golf Courses API + local DB with location bias
      const params = new URLSearchParams({ q: searchTerm })
      if (center[0] !== 0 && center[1] !== 0) {
        params.set('lat', center[1].toString())
        params.set('lng', center[0].toString())
        params.set('radiusKm', '50')
      }

      const golfApiResponse = await fetch(`/api/courses/search?${params.toString()}`)
      if (golfApiResponse.ok) {
        const golfData = await golfApiResponse.json()
        const golfCourses = (golfData.courses || [])
          .filter((course: any) => course.latitude && course.longitude)
          .map((course: any) => ({
            id: course.source === 'external' ? undefined : course.id,
            name: course.name,
            location: course.location,
            latitude: course.latitude,
            longitude: course.longitude,
            par: course.par,
            source: course.source || 'local',
            externalId: course.externalId,
            timesPlayed: course.timesPlayed,
            distance_km: course.distance_km
          }))
          .slice(0, 12) // Increased limit for better selection

        if (golfCourses.length > 0) {
          console.log(`Found ${golfCourses.length} golf courses from API for "${searchTerm}"`)
          setResults(golfCourses)
          setSearchLoading(false)
          return
        }
      }
    } catch (golfApiError) {
      console.warn('Golf API search failed, falling back to Mapbox:', golfApiError)
    }

    // Fallback to Mapbox search if Golf API fails or returns no results
    try {
      if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        console.warn('No Mapbox token available for fallback search')
        setResults([])
        setSearchLoading(false)
        return
      }

      // Enhanced golf course search strategy
      const golfTerms = ['golf', 'course', 'club', 'country club', 'cc', 'gc']
      const hasGolfTerm = golfTerms.some(term => searchTerm.toLowerCase().includes(term))

      // Try multiple search variations for better golf course results
      const searchQueries = [
        hasGolfTerm ? searchTerm : `${searchTerm} golf course`,
        hasGolfTerm ? searchTerm : `${searchTerm} country club`,
        hasGolfTerm ? searchTerm : `${searchTerm} golf club`
      ]

      let allResults: any[] = []

      for (const query of searchQueries) {
        try {
          const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`)
          url.searchParams.set('types', 'poi') // Only POI, exclude address to avoid street addresses
          url.searchParams.set('limit', '10')
          url.searchParams.set('proximity', `${center[0]},${center[1]}`)
          url.searchParams.set('access_token', process.env.NEXT_PUBLIC_MAPBOX_TOKEN)

          const r = await fetch(url.toString())
          const json = await r.json()
          const results = (json.features || [])
            .filter((f: any) => {
              if (!f.center || !f.place_name) return false

              // Only accept POI place types (avoid addresses)
              const placeTypes = f.place_type || []
              if (!placeTypes.includes('poi')) {
                return false
              }

              // Filter for golf-related places with enhanced detection
              const text = (f.text || '').toLowerCase()
              const placeName = (f.place_name || '').toLowerCase()
              const properties = f.properties || {}
              const category = (properties.category || '').toLowerCase()
              const context = (f.context || []).map((c: any) => c.text?.toLowerCase() || '').join(' ')
              const allText = `${text} ${placeName} ${context} ${category}`.toLowerCase()

              // Prefer venues with golf category or explicit golf terms
              const hasGolfCategory = category.includes('golf') || category.includes('golf course')
              const hasGolfTerms = golfTerms.some(term => allText.includes(term)) ||
                                 allText.includes('resort') ||
                                 allText.includes('links')

              return hasGolfCategory || hasGolfTerms
            })
            .map((f: any) => ({
              name: f.text || f.place_name,
              location: f.place_name,
              longitude: f.center[0],
              latitude: f.center[1],
              source: 'mapbox' as const
            }))

          allResults.push(...results)
        } catch (e) {
          console.error(`Search failed for query "${query}":`, e)
        }
      }

      // Remove duplicates and prioritize golf-specific results
      const uniqueResults = Array.from(new Map(allResults.map(item => [item.name, item])).values())
      const golfPrioritized = uniqueResults.sort((a, b) => {
        const aGolf = golfTerms.some(term => a.name.toLowerCase().includes(term))
        const bGolf = golfTerms.some(term => b.name.toLowerCase().includes(term))
        if (aGolf && !bGolf) return -1
        if (!aGolf && bGolf) return 1
        return 0
      })

      console.log(`Mapbox fallback found ${golfPrioritized.length} results for "${searchTerm}"`)
      setResults(golfPrioritized.slice(0, 8)) // Limit to 8 best results
    } catch (e) {
      console.error('All search methods failed:', e)
      setResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [center])

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value)
    
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId)
    }
    
    const timeoutId = setTimeout(() => {
      searchCourses(value)
    }, 500) // 500ms debounce
    
    setSearchTimeoutId(timeoutId)
  }

  const createAndSelect = async (c: MapCourse) => {
    // If it's an external course from Golf API, import it for richer data and deduplication
    if (c.source === 'external' && c.externalId) {
      try {
        const r = await fetch('/api/courses/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalId: c.externalId.toString(),
            source: 'golfcourseapi'
          }),
        })
        if (r.ok) {
          const imported = await r.json()
          onSelect({ id: imported.id, name: imported.name, location: imported.location, latitude: imported.latitude, longitude: imported.longitude, par: imported.par })
          onClose?.()
          return
        }
      } catch (e) {
        console.error('Failed to import course from Golf API:', e)
      }
    }

    // For Mapbox results or fallback, create a basic course
    try {
      const r = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: c.name,
          location: c.location,
          par: c.par || 72,
          latitude: c.latitude,
          longitude: c.longitude
        }),
      })
      if (r.ok) {
        const created = await r.json()
        onSelect({ id: created.id, name: created.name, location: created.location, latitude: created.latitude, longitude: created.longitude, par: created.par })
        onClose?.()
      }
    } catch (e) {
      console.error('Failed to create course:', e)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search for any golf course (e.g. Pebble Beach, Augusta National, St. Andrews)"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-11 h-12 text-base rounded-xl border-border/50 focus:border-golf-green"
          />
          {searchLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-golf-green h-5 w-5 animate-spin" />
          )}
        </div>
        {onClose && showClose && (
          <Button variant="outline" type="button" onClick={onClose} className="rounded-xl border-border/50">Close</Button>
        )}
      </div>
      
      <div ref={mapContainer} style={{ height }} className="rounded-xl overflow-hidden border border-border/50 shadow-soft" />

      {/* Database courses */}
      {dbNearby.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4 text-golf-green" />
            <span>Nearby courses ({dbNearby.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {dbNearby.map((course, i) => (
              <button
                key={course.id || i}
                className="text-left p-3 border border-border/50 rounded-xl hover:bg-golf-green-light/30 hover:border-golf-green/30 transition-all duration-200 group"
                onClick={() => onSelect(course)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-foreground group-hover:text-golf-green transition-colors">{course.name}</div>
                  {course.timesPlayed && course.timesPlayed > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-600 rounded-md px-2 py-1 font-medium">
                      Played {course.timesPlayed}x
                    </span>
                  )}
                </div>
                {course.location && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {course.location}
                    {course.distance_km && ` • ${course.distance_km.toFixed(1)}km away`}
                  </div>
                )}
                <div className="text-xs text-golf-green font-medium mt-1">Par {course.par || 72}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Search className="h-4 w-4 text-golf-green" />
            <span>Golf courses found ({results.length})</span>
            {results.some(r => r.source === 'external') && (
              <span className="text-xs bg-golf-green/10 text-golf-green px-2 py-1 rounded-full ml-auto">
                Verified courses included
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {results.map((r, i) => {
              const isVerifiedGolfCourse = r.source === 'external' || r.source === 'local'
              const isExistingCourse = r.id && r.source === 'local'
              const isMapboxResult = !r.source || r.source === 'mapbox'

              return (
                <button
                  key={r.id || i}
                  className={cn(
                    "text-left p-3 border rounded-xl transition-all duration-200 group",
                    isVerifiedGolfCourse
                      ? "border-golf-green/30 hover:bg-golf-green/5 hover:border-golf-green/50 bg-golf-green/5"
                      : "border-border/50 hover:bg-muted/30 hover:border-border"
                  )}
                  onClick={() => {
                    if (isExistingCourse) {
                      onSelect(r)
                    } else {
                      createAndSelect(r)
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className={cn(
                      "h-4 w-4 mt-0.5 flex-shrink-0",
                      isVerifiedGolfCourse ? "text-golf-green" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-semibold transition-colors truncate",
                          isVerifiedGolfCourse ? "text-golf-green group-hover:text-golf-green" : "text-foreground group-hover:text-foreground"
                        )}>{r.name}</span>
                        {isVerifiedGolfCourse && (
                          <span className="px-2 py-1 text-xs bg-golf-green/10 text-golf-green rounded-md font-medium border border-golf-green/20 flex-shrink-0">
                            Verified
                          </span>
                        )}
                        {r.timesPlayed && r.timesPlayed > 0 && (
                          <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md font-medium flex-shrink-0">
                            Played {r.timesPlayed}x
                          </span>
                        )}
                        {r.par && (
                          <span className="text-xs font-normal text-muted-foreground flex-shrink-0">
                            Par {r.par}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {r.location && (
                    <div className="text-sm text-muted-foreground ml-6">
                      {r.location}
                      {r.distance_km && ` • ${r.distance_km.toFixed(1)}km away`}
                    </div>
                  )}
                  <div className={cn(
                    "text-xs font-medium mt-2 px-2 py-1 rounded-md inline-block",
                    isExistingCourse
                      ? "text-golf-green bg-golf-green/10"
                      : isVerifiedGolfCourse
                      ? "text-golf-green bg-golf-green/10"
                      : "text-info bg-info/10"
                  )}>
                    {isExistingCourse
                      ? "✓ Select this course"
                      : isVerifiedGolfCourse
                      ? "✓ Verified Golf Course - Click to add"
                      : "Click to add as new course"}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {search && results.length === 0 && !searchLoading && (
        <div className="text-sm text-muted-foreground text-center py-6 space-y-2">
          <div className="font-medium">No golf courses found for &quot;{search}&quot;</div>
          <div className="text-xs">Try searching for the course name, city, or famous golf destinations</div>
        </div>
      )}
    </div>
  )
}
