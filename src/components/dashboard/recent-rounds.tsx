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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Recent Rounds</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/rounds/new">
            <Plus className="h-4 w-4 mr-2" />
            New Round
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {rounds.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No rounds recorded yet</p>
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
              <Link key={round.id} href={`/rounds/${round.id}`}>
                <div className="flex items-center justify-between hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(round.totalScore, round.totalPar)}`}>
                      {round.totalScore}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{round.course.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(round.date), 'MMM d')}
                        </span>
                        {round.course.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {round.course.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {round.totalScore > round.totalPar ? '+' : ''}{round.totalScore - round.totalPar} to par
                    </div>
                  </div>
                </div>
              </Link>
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
