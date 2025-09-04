import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface CourseListItem {
  id: string
  name: string
  location: string | null
  par: number
  roundsCount: number
}

export function CourseList({ courses }: { courses: CourseListItem[] }) {
  if (courses.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((c) => (
        <Card key={c.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>{c.name}</span>
              <span className="text-sm text-gray-500">Par {c.par}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            {c.location && <p>{c.location}</p>}
            <p>
              Rounds played: <span className="font-medium text-gray-900">{c.roundsCount}</span>
            </p>
            <Link href={`/rounds/new`} className="text-green-700 hover:underline">
              Record a round
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
