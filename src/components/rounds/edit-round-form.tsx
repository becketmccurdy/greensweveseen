'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import * as toast from '@/lib/ui/toast'

interface Course {
  id: string
  name: string
  location: string | null
  par: number
}

interface Score {
  id: string
  hole: number
  strokes: number
  par: number
  putts: number | null
  fairway: boolean | null
  gir: boolean | null
  notes: string | null
}

interface Round {
  id: string
  date: Date
  totalScore: number
  notes: string | null
  courseId: string
  course: Course
  scores: Score[]
}

interface EditRoundFormProps {
  round: Round
  courses: Course[]
}

export function EditRoundForm({ round, courses }: EditRoundFormProps) {
  const [courseId, setCourseId] = useState(round.courseId)
  const [date, setDate] = useState(format(new Date(round.date), 'yyyy-MM-dd'))
  const [score, setScore] = useState(round.totalScore.toString())
  const [notes, setNotes] = useState(round.notes || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const updateAction = fetch(`/api/rounds/${round.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        date: new Date(date).toISOString(),
        score: parseInt(score),
        notes: notes.trim() || null,
      }),
    })

    try {
      await toast.serverAction(updateAction, {
        loading: 'Updating round...',
        success: 'Round updated successfully!',
        error: 'Failed to update round. Please try again.',
      })
      
      router.push(`/rounds/${round.id}`)
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedCourse = courses.find(c => c.id === courseId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Round Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                      {course.location && ` - ${course.location}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Total Score</Label>
              <Input
                id="score"
                type="number"
                min="1"
                max="300"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
              />
              {selectedCourse && (
                <p className="text-sm text-gray-500">
                  Course par: {selectedCourse.par} 
                  {parseInt(score) && ` (${parseInt(score) > selectedCourse.par ? '+' : ''}${parseInt(score) - selectedCourse.par} to par)`}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about your round..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Round'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
