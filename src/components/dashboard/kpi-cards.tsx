import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, BarChart3, Trophy, Users } from 'lucide-react'

interface KPICardsProps {
  totalRounds: number
  bestScore: number | null
  averageScore: number | null
  handicap: number | null
  friendsRoundsCount: number
}

export function KPICards({ totalRounds, bestScore, averageScore, handicap, friendsRoundsCount }: KPICardsProps) {
  const kpis = [
    {
      title: 'Total Rounds',
      value: totalRounds.toString(),
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Best Score',
      value: bestScore ? bestScore.toString() : '-',
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Average Score',
      value: averageScore ? Math.round(averageScore).toString() : '-',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Handicap',
      value: handicap ? handicap.toString() : 'Not set',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
