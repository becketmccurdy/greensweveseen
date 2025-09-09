'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoundsStore } from '@/lib/stores/rounds-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import MapCoursePicker, { type MapCourse } from '@/components/courses/map-course-picker'
import { CourseSearchInput } from '@/components/courses/course-search-input'

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
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [weather, setWeather] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewCourse, setShowNewCourse] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseLocation, setNewCourseLocation] = useState('')
  const [newCoursePar, setNewCoursePar] = useState('72')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [useHoleByHole, setUseHoleByHole] = useState(false)
  const [holes, setHoles] = useState(
    Array.from({ length: 18 }, (_v, i) => ({
      hole: i + 1,
      strokes: '',
      par: '4',
      putts: '',
      fairway: false,
      gir: false,
      notes: '',
    }))
  )
  
  const router = useRouter()

  // Friends selection state
  const [withFriends, setWithFriends] = useState(false)
  const [friends, setFriends] = useState<Array<{ userId: string; name: string }>>([])
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])

  useEffect(() => {
    // Load accepted friends for selection
    const loadFriends = async () => {
      try {
        const r = await fetch('/api/friends')
        if (!r.ok) return
        const data = await r.json()
        const accepted = (data || []).filter((f: any) => f.isAccepted)
        const shaped = accepted.map((f: any) => ({
          userId: f.friend.userId as string,
          name: [f.friend.firstName, f.friend.lastName].filter(Boolean).join(' ') || f.friend.email,
        }))
        setFriends(shaped)
      } catch (e) {
        console.error('Failed to load friends', e)
      }
    }
    loadFriends()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!selectedCourse) {
      newErrors.course = 'Please select a course'
    }
    
    if (!useHoleByHole) {
      if (!totalScore) {
        newErrors.score = 'Please enter your total score'
      } else {
        const score = parseInt(totalScore)
        if (isNaN(score) || score < 50 || score > 150) {
          newErrors.score = 'Score must be between 50 and 150'
        }
      }
    } else {
      // At least one hole must have strokes entered
      const anyStrokes = holes.some((h) => h.strokes !== '')
      if (!anyStrokes) {
        newErrors.holes = 'Enter strokes for at least one hole or turn off hole-by-hole'
      }
    }
    
    if (!date) {
      newErrors.date = 'Please select a date'
    } else {
      const selectedDate = new Date(date)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    
    // Compute totals
    let computedTotalScore: number
    let computedTotalPar: number
    let useHoles = false
    if (useHoleByHole) {
      const filled = holes.filter((h) => h.strokes !== '')
      if (filled.length > 0) {
        computedTotalScore = filled.reduce((a, h) => a + (parseInt(h.strokes) || 0), 0)
        computedTotalPar = filled.reduce((a, h) => a + (parseInt(h.par) || 4), 0)
        useHoles = true
      } else {
        computedTotalScore = parseInt(totalScore)
        computedTotalPar = selectedCourse ? selectedCourse.par : 72
      }
    } else {
      computedTotalScore = parseInt(totalScore)
      computedTotalPar = selectedCourse ? selectedCourse.par : 72
    }

    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    
    // Add optimistic round to store
    const { addRoundOptimistic, confirmRound, removeOptimisticRound } = useRoundsStore.getState()
    addRoundOptimistic({
      tempId,
      date: new Date(date),
      totalScore: computedTotalScore,
      totalPar: computedTotalPar,
      withFriends,
      course: {
        name: selectedCourse!.name,
        location: selectedCourse!.location,
      },
      weather,
      notes,
    })

    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse!.id,
          totalScore: computedTotalScore,
          totalPar: computedTotalPar,
          date: new Date(date).toISOString(),
          weather: weather || null,
          notes: notes || null,
          withFriends,
          friendUserIds: withFriends ? selectedFriendIds : [],
        }),
      })

      if (response.ok) {
        const round = await response.json()

        // Confirm the optimistic update with real data
        confirmRound(tempId, {
          ...round,
          date: new Date(round.date),
          course: {
            name: selectedCourse!.name,
            location: selectedCourse!.location,
          }
        })

        // If using hole-by-hole, save scores
        if (useHoles) {
          const scoresPayload = holes
            .filter((h) => h.strokes !== '')
            .map((h) => ({
              hole: h.hole,
              strokes: parseInt(h.strokes) || 0,
              par: parseInt(h.par) || 4,
              putts: h.putts ? parseInt(h.putts) : null,
              fairway: h.fairway || null,
              gir: h.gir || null,
              notes: h.notes || null,
            }))
          if (scoresPayload.length > 0) {
            const sr = await fetch('/api/scores', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roundId: round.id, scores: scoresPayload })
            })
            if (!sr.ok) {
              const se = await sr.json().catch(() => ({}))
              console.error('Failed to save hole scores:', se)
            }
          }
        }

        toast.success(`Round saved successfully! Score: ${round.totalScore}`)
        router.push('/dashboard')
      } else {
        // Remove optimistic update on failure
        removeOptimisticRound(tempId)
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save round')
      }
    } catch (error) {
      // Remove optimistic update on error
      removeOptimisticRound(tempId)
      console.error('Error saving round:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save round. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourseName) {
      toast.error('Please enter a course name')
      return
    }

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
        toast.success(`Course "${newCourse.name}" created successfully!`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create course')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create course. Please try again.')
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
            <CourseSearchInput
              onCourseSelect={(course) => {
                setSelectedCourse(course)
                if (errors.course) {
                  setErrors(prev => ({ ...prev, course: '' }))
                }
              }}
              placeholder="Search for a golf course..."
            />
            {selectedCourse && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-900">{selectedCourse.name}</div>
                    <div className="text-sm text-green-700">
                      {selectedCourse.location} • Par {selectedCourse.par}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCourse(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMapPicker((v) => !v)}
                disabled={loading}
                size="sm"
              >
                {showMapPicker ? 'Hide Map' : 'Pick from Map'}
              </Button>
            </div>
            {errors.course && (
              <p className="text-sm text-red-600">{errors.course}</p>
            )}
            {showMapPicker && (
              <div className="p-3 border rounded-lg">
                <MapCoursePicker
                  onSelect={(c: MapCourse) => {
                    if (c.id) {
                      setSelectedCourse({ id: c.id, name: c.name, location: c.location ?? null, par: c.par ?? 72 })
                      setShowMapPicker(false)
                      if (errors.course) setErrors(prev => ({ ...prev, course: '' }))
                    }
                  }}
                  onClose={() => setShowMapPicker(false)}
                  height={300}
                />
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
                onChange={(e) => {
                  setTotalScore(e.target.value)
                  if (errors.score) {
                    setErrors(prev => ({ ...prev, score: '' }))
                  }
                }}
                placeholder="e.g. 85"
                min="50"
                max="150"
                className={errors.score ? 'border-red-500' : ''}
                required={!useHoleByHole}
              />
              {errors.score && (
                <p className="text-sm text-red-600">{errors.score}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  if (errors.date) {
                    setErrors(prev => ({ ...prev, date: '' }))
                  }
                }}
                className={errors.date ? 'border-red-500' : ''}
                required
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date}</p>
              )}
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

          {/* Friends */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Played with friends?</Label>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={withFriends}
                onChange={(e) => setWithFriends(e.target.checked)}
              />
            </div>
            {withFriends && (
              <div className="p-3 border rounded-lg space-y-2">
                {friends.length === 0 ? (
                  <p className="text-sm text-gray-500">No accepted friends yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {friends.map((f) => {
                      const checked = selectedFriendIds.includes(f.userId)
                      return (
                        <label key={f.userId} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedFriendIds((prev) =>
                                e.target.checked ? [...prev, f.userId] : prev.filter((id) => id !== f.userId)
                              )
                            }}
                          />
                          <span>{f.name}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
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
            disabled={!selectedCourse || (!useHoleByHole && !totalScore) || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Round'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
