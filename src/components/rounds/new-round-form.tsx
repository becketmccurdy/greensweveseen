'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

interface Course {
  id: string
  name: string
  location: string | null
  par: number
}

interface NewRoundFormProps {
  courses: Course[]
}

export function NewRoundForm({ courses }: NewRoundFormProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [totalScore, setTotalScore] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [weather, setWeather] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewCourse, setShowNewCourse] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseLocation, setNewCourseLocation] = useState('')
  const [newCoursePar, setNewCoursePar] = useState('72')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse || !totalScore) return

    setLoading(true)
    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          totalScore: parseInt(totalScore),
          totalPar: selectedCourse.par,
          date: new Date(date).toISOString(),
          weather: weather || null,
          notes: notes || null,
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        throw new Error('Failed to save round')
      }
    } catch (error) {
      console.error('Error saving round:', error)
      alert('Failed to save round. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourseName) return

    setLoading(true)
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCourseName,
          location: newCourseLocation || null,
          par: parseInt(newCoursePar),
        }),
      })

      if (response.ok) {
        const newCourse = await response.json()
        setSelectedCourse(newCourse)
        setShowNewCourse(false)
        setNewCourseName('')
        setNewCourseLocation('')
        setNewCoursePar('72')
      } else {
        throw new Error('Failed to create course')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Round Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            {!showNewCourse ? (
              <div className="flex gap-2">
                <Select
                  value={selectedCourse?.id || ''}
                  onValueChange={(value) => {
                    const course = courses.find(c => c.id === value)
                    setSelectedCourse(course || null)
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} {course.location && `(${course.location})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCourse(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add New Course</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewCourse(false)}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="e.g. Pebble Beach"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseLocation">Location</Label>
                    <Input
                      id="courseLocation"
                      value={newCourseLocation}
                      onChange={(e) => setNewCourseLocation(e.target.value)}
                      placeholder="e.g. Monterey, CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coursePar">Par</Label>
                    <Input
                      id="coursePar"
                      type="number"
                      value={newCoursePar}
                      onChange={(e) => setNewCoursePar(e.target.value)}
                      min="60"
                      max="80"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleCreateCourse}
                  disabled={!newCourseName || loading}
                  className="w-full"
                >
                  Create Course
                </Button>
              </div>
            )}
          </div>

          {/* Score and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Total Score</Label>
              <Input
                id="score"
                type="number"
                value={totalScore}
                onChange={(e) => setTotalScore(e.target.value)}
                placeholder="e.g. 85"
                min="50"
                max="150"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-2">
            <Label htmlFor="weather">Weather (optional)</Label>
            <Input
              id="weather"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="e.g. Sunny, 75°F, light wind"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the round go? Any highlights or areas to improve?"
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!selectedCourse || !totalScore || loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Round'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
