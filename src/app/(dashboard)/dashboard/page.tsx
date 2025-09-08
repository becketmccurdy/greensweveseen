import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface KPIData {
  totalRounds: number
  bestScore: number | null
  averageScore: number | null
  handicap: number | null
}

async function getDashboardData(userId: string) {
  const rounds = await prisma.round.findMany({
    where: { userId },
    include: {
      course: {
        select: { name: true, location: true }
      }
    },
    orderBy: { date: 'desc' }
  })

  let kpiData: KPIData = {
    totalRounds: 0,
    bestScore: null,
    averageScore: null,
    handicap: null,
  }

  if (rounds.length > 0) {
    const scores = rounds.map((r: any) => r.totalScore)
    const bestScore = Math.min(...scores)
    const averageScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)

    kpiData = {
      totalRounds: rounds.length,
      bestScore,
      averageScore,
      handicap: averageScore, // Simplified handicap for now
    }
  }

  return { kpiData, rounds }
}

export default async function DashboardPage() {
  const profile = await getUserProfile()
  const { kpiData, rounds } = await getDashboardData(profile.userId)

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your golf performance overview.
        </p>
      </div>

      <DashboardClient initialRounds={rounds} initialKPIData={kpiData} />
    </div>
  )
}
