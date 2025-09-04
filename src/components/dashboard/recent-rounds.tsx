import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface Round {
  id: string
  date: Date
  totalScore: number
  totalPar: number
  course: {
    name: string
    location: string | null
  }
}

interface RecentRoundsProps {
  rounds: Round[]
}

export function RecentRounds({ rounds }: RecentRoundsProps) {
  const getScoreColor = (score: number, par: number) => {
    const diff = score - par
    if (diff <= -2) return 'text-green-600 bg-green-50'
    if (diff === -1) return 'text-blue-600 bg-blue-50'
    if (diff === 0) return 'text-gray-600 bg-gray-50'
    if (diff === 1) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Rounds</CardTitle>
        <Button asChild size="sm">
          <Link href="/rounds/new">
            <Plus className="h-4 w-4 mr-2" />
            New Round
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {rounds.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rounds yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your golf scores today!</p>
            <Button asChild>
              <Link href="/rounds/new">
                <Plus className="h-4 w-4 mr-2" />
                Record Your First Round
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{round.course.name}</h4>
                    {round.course.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {round.course.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(round.date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(round.totalScore, round.totalPar)}`}>
                    {round.totalScore}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {round.totalScore > round.totalPar ? '+' : ''}{round.totalScore - round.totalPar}
                  </div>
                </div>
              </div>
            ))}
            
            {rounds.length >= 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" asChild>
                  <Link href="/rounds">View All Rounds</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
