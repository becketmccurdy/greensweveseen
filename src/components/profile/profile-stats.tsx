import { Trophy, Target, MapPin, Calendar } from 'lucide-react'

interface ProfileStatsProps {
  totalRounds: number
  averageScore: number
  bestScore: number
  coursesPlayed: number
}

export function ProfileStats({ totalRounds, averageScore, bestScore, coursesPlayed }: ProfileStatsProps) {
  const stats = [
    {
      label: 'Total Rounds',
      value: totalRounds,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      label: 'Average Score',
      value: averageScore > 0 ? averageScore : '-',
      icon: Target,
      color: 'text-green-600'
    },
    {
      label: 'Best Score',
      value: bestScore > 0 ? bestScore : '-',
      icon: Trophy,
      color: 'text-yellow-600'
    },
    {
      label: 'Courses Played',
      value: coursesPlayed,
      icon: MapPin,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
            <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        )
      })}
    </div>
  )
}
