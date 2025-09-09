"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Search, Loader2 } from 'lucide-react'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export type MapCourse = {
  id?: string
  name: string
  location?: string | null
  latitude: number
  longitude: number
  par?: number
}

interface MapCoursePickerProps {
  onSelect: (course: MapCourse) => void
  onClose?: () => void
  height?: number
}

export default function MapCoursePicker({ onSelect, onClose, height = 360 }: MapCoursePickerProps) {
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

  const searchMapbox = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setResults([])
      return
    }
    
    setSearchLoading(true)
    try {
      const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json`)
      url.searchParams.set('types', 'poi,address')
      url.searchParams.set('limit', '10')
      url.searchParams.set('proximity', `${center[0]},${center[1]}`)
      url.searchParams.set('access_token', process.env.NEXT_PUBLIC_MAPBOX_TOKEN)
      
      // Add golf-related keywords to improve search results
      const golfTerms = ['golf', 'course', 'club', 'country club']
      const searchWithGolf = golfTerms.some(term => searchTerm.toLowerCase().includes(term)) 
        ? searchTerm 
        : `${searchTerm} golf course`
      
      const r = await fetch(url.toString().replace(encodeURIComponent(searchTerm), encodeURIComponent(searchWithGolf)))
      const json = await r.json()
      const items: MapCourse[] = (json.features || [])
        .filter((f: any) => f.center && f.place_name)
        .map((f: any) => ({
          name: f.text || f.place_name,
          location: f.place_name,
          longitude: f.center[0],
          latitude: f.center[1],
        }))
      setResults(items)
    } catch (e) {
      console.error('Mapbox search failed:', e)
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
      searchMapbox(value)
    }, 500) // 500ms debounce
    
    setSearchTimeoutId(timeoutId)
  }

  const createAndSelect = async (c: MapCourse) => {
    // Create in our DB and return
    try {
      const r = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: c.name, location: c.location, par: 72, latitude: c.latitude, longitude: c.longitude }),
      })
      if (r.ok) {
        const created = await r.json()
        onSelect({ id: created.id, name: created.name, location: created.location, latitude: created.latitude, longitude: created.longitude, par: created.par })
        onClose?.()
      }
    } catch (e) {
      console.error('Failed to create course from Mapbox:', e)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search golf courses (e.g. Pebble Beach)" 
            value={search} 
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
          )}
        </div>
        {onClose && (
          <Button variant="outline" type="button" onClick={onClose}>Close</Button>
        )}
      </div>
      
      <div ref={mapContainer} style={{ height }} className="rounded-lg overflow-hidden border" />

      {/* Database courses */}
      {dbNearby.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Nearby courses ({dbNearby.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {dbNearby.map((course, i) => (
              <button 
                key={course.id || i} 
                className="text-left p-3 border rounded hover:bg-gray-50 transition-colors"
                onClick={() => onSelect(course)}
              >
                <div className="font-medium text-gray-900">{course.name}</div>
                {course.location && <div className="text-sm text-gray-600">{course.location}</div>}
                <div className="text-xs text-gray-500">Par {course.par || 72}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Search className="h-4 w-4" />
            <span>Search results ({results.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {results.map((r, i) => (
              <button 
                key={i} 
                className="text-left p-3 border rounded hover:bg-gray-50 transition-colors"
                onClick={() => createAndSelect(r)}
              >
                <div className="font-medium text-gray-900">{r.name}</div>
                {r.location && <div className="text-sm text-gray-600">{r.location}</div>}
                <div className="text-xs text-green-600">Click to add as new course</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {search && results.length === 0 && !searchLoading && (
        <div className="text-sm text-gray-500 text-center py-4">
          No results found. Try a different search term.
        </div>
      )}
    </div>
  )
}
