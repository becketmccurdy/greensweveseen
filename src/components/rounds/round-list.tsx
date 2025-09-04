import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface RoundListItem {
  id: string
  date: string | Date
  totalScore: number
  notes: string | null
  course: {
    id: string
    name: string
    par: number
    location: string | null
  }
}

function toShortDate(d: string | Date) {
  try {
    const date = new Date(d)
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return String(d)
  }
}

export function RoundList({ rounds }: { rounds: RoundListItem[] }) {
  if (rounds.length === 0) return null

  return (
    <div className="space-y-3">
      {rounds.map((r) => {
        const diff = r.totalScore - (r.course.par ?? 72)
        const sign = diff > 0 ? '+' : ''
        return (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{r.course.name}</span>
                <span className="text-sm text-gray-500">{toShortDate(r.date)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 flex items-center justify-between">
              <div>
                <div>
                  Score: <span className="font-semibold text-gray-900">{r.totalScore}</span>
                  {typeof r.course.par === 'number' && (
                    <span className="ml-2 text-gray-600">({sign}{diff} to par)</span>
                  )}
                </div>
                {r.notes && <div className="text-gray-500 mt-1 line-clamp-1">{r.notes}</div>}
              </div>
              <div className="flex gap-3">
                <Link href={`/rounds/${r.id}`} className="text-green-700 hover:underline">View</Link>
                <Link href={`/rounds/${r.id}/edit`} className="text-gray-700 hover:underline">Edit</Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
