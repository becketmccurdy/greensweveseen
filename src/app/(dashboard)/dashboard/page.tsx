import { getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { RecentRounds } from '@/components/dashboard/recent-rounds'

async function getDashboardData(userId: string) {
  const [rounds, totalRounds, bestScore, averageScore] = await Promise.all([
    // Recent rounds with course info
    prisma.round.findMany({
      where: { userId },
      include: {
        course: true,
        scores: true,
      },
      orderBy: { date: 'desc' },
      take: 5,
    }),
    // Total rounds count
    prisma.round.count({
      where: { userId },
    }),
    // Best score
    prisma.round.findFirst({
      where: { userId },
      orderBy: { totalScore: 'asc' },
      select: { totalScore: true },
    }),
    // Average score calculation
    prisma.round.aggregate({
      where: { userId },
      _avg: { totalScore: true },
    }),
  ])

  return {
    rounds,
    totalRounds,
    bestScore: bestScore?.totalScore || null,
    averageScore: averageScore._avg.totalScore || null,
  }
}

export default async function DashboardPage() {
  const profile = await getUserProfile()
  const dashboardData = await getDashboardData(profile.userId)

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {profile.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's how your golf game is progressing
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards
        totalRounds={dashboardData.totalRounds}
        bestScore={dashboardData.bestScore}
        averageScore={dashboardData.averageScore}
        handicap={profile.handicap}
      />

      {/* Recent Rounds */}
      <RecentRounds rounds={dashboardData.rounds} />
    </div>
  )
}
