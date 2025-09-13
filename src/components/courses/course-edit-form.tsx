"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function CourseEditForm({
  id,
  initialName,
  initialLocation,
  initialPar,
}: {
  id: string
  initialName: string
  initialLocation: string | null
  initialPar: number
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [location, setLocation] = useState(initialLocation || "")
  const [par, setPar] = useState(String(initialPar || 72))
  const [busy, setBusy] = useState<"save" | "delete" | null>(null)

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy("save")
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim() || null,
          par: Number(par) || 72,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update course")
      }
      toast.success("Course updated")
      router.push(`/my-courses`)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update course")
    } finally {
      setBusy(null)
    }
  }

  const onDelete = async () => {
    if (!confirm("Delete this course? This cannot be undone.")) return
    setBusy("delete")
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete course")
      }
      toast.success("Course deleted")
      router.push("/my-courses")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete course")
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Course</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
          </div>
          <div>
            <Label htmlFor="par">Par</Label>
            <Input id="par" type="number" min={54} max={90} value={par} onChange={(e) => setPar(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={busy === "save"}>
              {busy === "save" ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <div className="ml-auto" />
            <Button type="button" variant="outline" onClick={onDelete} disabled={busy === "delete"}>
              {busy === "delete" ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
