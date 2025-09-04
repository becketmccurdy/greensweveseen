import { getUserProfile } from '@/lib/auth'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { RecentRounds } from '@/components/dashboard/recent-rounds'

async function getRecentRounds(userId: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.round.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { date: 'desc' },
    take: 5
  })
}

async function getKPIData(userId: string) {
  const { prisma } = await import('@/lib/prisma')
  const rounds = await prisma.round.findMany({
    where: { userId },
    include: { course: true }
  })

  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      bestScore: null,
      averageScore: null,
      handicap: null
    }
  }

  const totalRounds = rounds.length
  const scores = rounds.map(r => r.totalScore)
  const bestScore = Math.min(...scores)
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  
  // Simple handicap calculation (average score - course par)
  const avgPar = rounds.reduce((sum, round) => sum + round.course.par, 0) / rounds.length
  const handicap = Math.round(averageScore - avgPar)

  return {
    totalRounds,
    bestScore,
    averageScore,
    handicap: handicap > 0 ? handicap : 0
  }
}

export default async function DashboardPage() {
  const userProfile = await getUserProfile()
  const recentRounds = await getRecentRounds(userProfile.userId)
  const kpiData = await getKPIData(userProfile.userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userProfile.name}!
        </h1>
        <p className="text-gray-600">Here's your golf performance overview</p>
      </div>

      <KPICards {...kpiData} />
      
      <RecentRounds rounds={recentRounds} />
    </div>
  )
}
