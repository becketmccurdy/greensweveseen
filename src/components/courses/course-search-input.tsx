'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Plus, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  name: string
  location: string | null
  par: number
  timesPlayed?: number
  source?: 'local' | 'external'
  externalId?: number
  latitude?: number
  longitude?: number
  address?: string
}

interface CourseSearchInputProps {
  onCourseSelect: (course: Course) => void
  placeholder?: string
  showAddNew?: boolean
}

export function CourseSearchInput({ 
  onCourseSelect, 
  placeholder = "Search for a golf course...",
  showAddNew = true 
}: CourseSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Search courses as user types
  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      setShowResults(false)
      return
    }

    if (query.length === 1) {
      // For single character, just show empty results so "Add new course" appears
      setResults([])
      setShowResults(true)
      return
    }

    const searchCourses = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/courses/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.courses || [])
          setShowResults(true)
        } else if (response.status === 401) {
          // User not authenticated, but still allow adding new courses
          console.log('User not authenticated, showing add new course option')
          setResults([])
          setShowResults(true)
        } else {
          // Other errors, still show add new course option
          console.error('Course search failed:', response.status, response.statusText)
          setResults([])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Course search error:', error)
        // Always show results panel so user can add new course
        setResults([])
        setShowResults(true)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchCourses, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Handle clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCourseSelect = (course: Course) => {
    setQuery(course.name)
    setShowResults(false)
    onCourseSelect(course)
  }

  const handleAddNewCourse = () => {
    setShowAddForm(true)
    setShowResults(false)
  }

  // Show "Add new course" option when input is focused and empty
  const handleInputFocus = () => {
    if (query.length >= 2) {
      setShowResults(true)
    } else if (query.length >= 1) {
      // Show add new course option for single character searches too
      setShowResults(true)
      setResults([])
    }
  }

  const handleCreateCourse = async (courseData: { name: string; location: string; par: number }) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      })

      if (response.ok) {
        const newCourse = await response.json()
        handleCourseSelect(newCourse)
        setShowAddForm(false)
        toast.success('Course added successfully!')
      } else {
        toast.error('Failed to add course')
      }
    } catch (error) {
      toast.error('Failed to add course')
    }
  }

  const handleSelectExternalCourse = async (course: Course) => {
    // If it's an external course, import it to our database first
    if (course.id.toString().startsWith('external-')) {
      try {
        const response = await fetch('/api/courses/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalId: course.externalId,
            source: 'golfcourseapi'
          })
        })

        if (response.ok) {
          const importedCourse = await response.json()
          handleCourseSelect(importedCourse)
        } else {
          toast.error('Failed to import course')
        }
      } catch (error) {
        toast.error('Failed to import course')
      }
    } else {
      handleCourseSelect(course)
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleInputFocus}
        className="w-full"
      />

      {showResults && (
        <Card ref={resultsRef} className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-2">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {/* Group courses by played status */}
                {results.filter(c => c.timesPlayed && c.timesPlayed > 0).length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-green-700 bg-green-50 rounded">
                      Courses You've Played
                    </div>
                    {results
                      .filter(c => c.timesPlayed && c.timesPlayed > 0)
                      .map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleSelectExternalCourse(course)}
                          className="w-full text-left p-3 rounded-lg hover:bg-green-50 transition-colors border-l-2 border-green-500"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{course.name}</div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {course.location || 'Location not specified'}
                                <span className="mx-2">•</span>
                                Par {course.par}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-green-600 font-medium">
                              <Clock className="h-3 w-3 mr-1" />
                              {course.timesPlayed} time{course.timesPlayed !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </button>
                      ))}
                  </>
                )}
                
                {/* Other courses */}
                {results.filter(c => !c.timesPlayed || c.timesPlayed === 0).length > 0 && (
                  <>
                    {results.filter(c => c.timesPlayed && c.timesPlayed > 0).length > 0 && (
                      <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded mt-2">
                        Other Courses
                      </div>
                    )}
                    {results
                      .filter(c => !c.timesPlayed || c.timesPlayed === 0)
                      .map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleSelectExternalCourse(course)}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{course.name}</div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {course.location || 'Location not specified'}
                                <span className="mx-2">•</span>
                                Par {course.par}
                              </div>
                            </div>
                            {course.source === 'external' && (
                              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                New
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 text-center">
                <div className="text-gray-500 mb-3">No courses found for "{query}"</div>
                {showAddNew && (
                  <Button
                    onClick={handleAddNewCourse}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add "{query}" as new course
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <AddCourseForm
          initialName={query}
          onSubmit={handleCreateCourse}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}

interface AddCourseFormProps {
  initialName: string
  onSubmit: (data: { name: string; location: string; par: number }) => void
  onCancel: () => void
}

function AddCourseForm({ initialName, onSubmit, onCancel }: AddCourseFormProps) {
  const [name, setName] = useState(initialName)
  const [location, setLocation] = useState('')
  const [par, setPar] = useState(72)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name: name.trim(), location: location.trim(), par })
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Add New Course</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Course Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Par</label>
            <Input
              type="number"
              value={par}
              onChange={(e) => setPar(parseInt(e.target.value) || 72)}
              min="54"
              max="90"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              Add Course
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
