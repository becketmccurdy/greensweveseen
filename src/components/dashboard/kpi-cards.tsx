import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, BarChart3, Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      color: 'text-golf-green',
      bgColor: 'bg-golf-green-light',
      darkBgColor: 'dark:bg-golf-green/10',
      trend: null,
      description: `${friendsRoundsCount} with friends`,
    },
    {
      title: 'Best Score',
      value: bestScore ? bestScore.toString() : '-',
      icon: Trophy,
      color: 'text-success',
      bgColor: 'bg-green-50',
      darkBgColor: 'dark:bg-green-900/20',
      trend: null,
      description: bestScore ? 'Personal best' : 'Play your first round',
    },
    {
      title: 'Average Score',
      value: averageScore ? Math.round(averageScore).toString() : '-',
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-blue-50',
      darkBgColor: 'dark:bg-blue-900/20',
      trend: null,
      description: averageScore ? 'Last 10 rounds' : 'Track your progress',
    },
    {
      title: 'Handicap Index',
      value: handicap ? handicap.toString() : '-',
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-orange-50',
      darkBgColor: 'dark:bg-orange-900/20',
      trend: null,
      description: handicap ? 'Official estimate' : 'Play more rounds',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              {kpi.trend && (
                <div className="flex items-center space-x-1 text-xs">
                  {kpi.trend > 0 ? (
                    <ArrowUp className="h-3 w-3 text-success" />
                  ) : kpi.trend < 0 ? (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "font-medium",
                    kpi.trend > 0 ? "text-success" :
                    kpi.trend < 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                  </span>
                </div>
              )}
            </div>
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
              kpi.bgColor,
              kpi.darkBgColor
            )}>
              <kpi.icon className={cn("h-5 w-5 transition-all duration-300", kpi.color)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {kpi.value}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
