import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EmptyDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to GreensWeveSeen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-600">You haven\'t recorded any rounds yet.</p>
        <Button asChild>
          <Link href="/rounds/new">Add your first round</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function EmptyRounds() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No rounds yet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-600">Start logging your golf rounds to see stats here.</p>
        <Button asChild>
          <Link href="/rounds/new">Record a round</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function EmptyCourses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No courses yet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-600">Create a course or record a round to populate your courses.</p>
        <div className="flex gap-2">
          <Button asChild variant="default">
            <Link href="/rounds/new">Record a round</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
