'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, Save, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Course = {
  id: string
  name: string
  location: string | null
  par: number
  owned?: boolean
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{ name: string; location: string; par: string }>({ name: '', location: '', par: '72' })
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses')
        if (!response.ok) throw new Error('Failed to fetch courses')
        const data: Course[] = await response.json()
        setCourses(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    fetchCourses()
  }, [])

  if (error) throw error
  if (!courses) return null

  const startEdit = (course: Course) => {
    setEditingId(course.id)
    setForm({ name: course.name, location: course.location || '', par: String(course.par) })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: string) => {
    setBusy(id)
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          location: form.location || null,
          par: Number(form.par) || 72,
        })
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to update course')
      }
      const updated = await res.json()
      setCourses((prev) => prev!.map((c) => (c.id === id ? { ...updated, owned: c.owned } : c)))
      setEditingId(null)
      toast.success('Course updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update course')
    } finally {
      setBusy(null)
    }
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to delete course')
      }
      setCourses((prev) => prev!.filter((c) => c.id !== id))
      toast.success('Course deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete course')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{course.name}</span>
              {course.owned && (
                <div className="flex items-center gap-2">
                  {editingId === course.id ? (
                    <>
                      <Button size="sm" onClick={() => saveEdit(course.id)} disabled={busy === course.id}>
                        {busy === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />Save</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEdit(course)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => deleteCourse(course.id)} disabled={busy === course.id}>
                        {busy === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingId === course.id ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor={`name-${course.id}`}>Name</Label>
                  <Input id={`name-${course.id}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor={`loc-${course.id}`}>Location</Label>
                  <Input id={`loc-${course.id}`} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor={`par-${course.id}`}>Par</Label>
                  <Input id={`par-${course.id}`} type="number" value={form.par} onChange={(e) => setForm({ ...form, par: e.target.value })} />
                </div>
              </div>
            ) : (
              <>
                <p>Location: {course.location || 'N/A'}</p>
                <p>Par: {course.par}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
