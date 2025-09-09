'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Grid, Map, Filter } from 'lucide-react'

interface CoursesFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  distance: number
  onDistanceChange: (distance: number) => void
  sort: string
  onSortChange: (sort: string) => void
  viewMode: 'grid' | 'map'
  onViewModeChange: (mode: 'grid' | 'map') => void
  userLocation: { lat: number; lng: number } | null
  onGetLocation: () => void
  loading?: boolean
}

const DISTANCE_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
]

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'distance', label: 'Distance' },
]

export function CoursesFilters({
  searchQuery,
  onSearchChange,
  distance,
  onDistanceChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  userLocation,
  onGetLocation,
  loading = false
}: CoursesFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            disabled={loading}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('map')}
            disabled={loading}
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>

        {/* Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          disabled={loading}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
          {/* Location and Distance */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Button
              variant="outline"
              onClick={onGetLocation}
              disabled={loading}
              className="w-full justify-start"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {userLocation ? 'Update Location' : 'Get Current Location'}
            </Button>
            {userLocation && (
              <p className="text-xs text-gray-500">
                Location set ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </p>
            )}
          </div>

          {/* Distance Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Distance</label>
            <Select
              value={distance.toString()}
              onValueChange={(value) => onDistanceChange(parseInt(value))}
              disabled={loading || !userLocation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                {DISTANCE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!userLocation && (
              <p className="text-xs text-gray-500">Set location to filter by distance</p>
            )}
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort by</label>
            <Select
              value={sort}
              onValueChange={onSortChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sort === 'distance' && !userLocation && (
              <p className="text-xs text-gray-500">Location required for distance sorting</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}