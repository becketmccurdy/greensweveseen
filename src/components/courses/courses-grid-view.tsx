'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, MapPin, Star, Users } from 'lucide-react'
import { CoursesEmpty } from '@/components/empty-states/courses-empty'

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

interface CoursesGridViewProps {
  courses: Course[]
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
  onSelect?: (course: Course) => void
}

export function CoursesGridView({ courses, onEdit, onDelete, onSelect }: CoursesGridViewProps) {
  if (courses.length === 0) {
    return <CoursesEmpty />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <Card 
          key={course.id} 
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            onSelect ? 'hover:bg-gray-50' : ''
          }`}
          onClick={() => onSelect?.(course)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{course.name}</h3>
                {course.location && (
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{course.location}</span>
                  </p>
                )}
              </div>
              {course.owned && (
                <div className="flex items-center gap-2 ml-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.(course)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(course)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Course Details */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Par {course.par}</Badge>
              {course.holes && course.holes !== 18 && (
                <Badge variant="outline">{course.holes} holes</Badge>
              )}
              {course.owned && (
                <Badge variant="default">Your Course</Badge>
              )}
              {course.distance_km && (
                <Badge variant="outline">
                  {course.distance_km.toFixed(1)} km away
                </Badge>
              )}
            </div>

            {/* Rating and Slope */}
            {(course.rating || course.slope) && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {course.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>Rating: {course.rating}</span>
                  </div>
                )}
                {course.slope && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Slope: {course.slope}</span>
                  </div>
                )}
              </div>
            )}

            {/* Coordinates Info */}
            {course.latitude && course.longitude && (
              <div className="text-xs text-gray-500">
                {course.latitude.toFixed(4)}, {course.longitude.toFixed(4)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}