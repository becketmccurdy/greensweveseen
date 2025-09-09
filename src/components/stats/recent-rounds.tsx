'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface RecentRound {
  id: string
  date: string
  score: number
  par: number
  toPar: number
  course: string
  weather: string | null
  notes: string | null
}

interface RecentRoundsProps {
  rounds: RecentRound[]
}

export function RecentRounds({ rounds }: RecentRoundsProps) {
  if (rounds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No recent rounds found
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreBadge = (toPar: number) => {
    if (toPar <= -2) {
      return <Badge className="bg-green-100 text-green-800">Eagle or Better</Badge>
    } else if (toPar === -1) {
      return <Badge className="bg-blue-100 text-blue-800">Birdie</Badge>
    } else if (toPar === 0) {
      return <Badge className="bg-gray-100 text-gray-800">Par</Badge>
    } else if (toPar === 1) {
      return <Badge className="bg-yellow-100 text-yellow-800">Bogey</Badge>
    } else if (toPar <= 3) {
      return <Badge className="bg-orange-100 text-orange-800">Double Bogey</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Triple+</Badge>
    }
  }

  const getScoreColor = (toPar: number) => {
    if (toPar < 0) return 'text-green-600'
    if (toPar === 0) return 'text-gray-600'
    if (toPar <= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Rounds</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rounds.map((round) => (
            <div key={round.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{round.course}</h3>
                  {getScoreBadge(round.toPar)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{format(new Date(round.date), 'MMM d, yyyy')}</span>
                  {round.weather && <span>• {round.weather}</span>}
                </div>
                {round.notes && (
                  <p className="text-sm text-gray-500 mt-1 italic">&quot;{round.notes}&quot;</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  <span className={getScoreColor(round.toPar)}>
                    {round.score}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Par {round.par} 
                  <span className={`ml-1 ${getScoreColor(round.toPar)}`}>
                    ({round.toPar > 0 ? '+' : ''}{round.toPar})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
