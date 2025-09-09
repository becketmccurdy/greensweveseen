import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { getUserProfile } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

interface KPIData {
  totalRounds: number
  bestScore: number | null
  averageScore: number | null
  handicap: number | null
  friendsRoundsCount: number
}

async function getDashboardData(userId: string) {
  const prisma = getPrisma()
  const prismaRounds = await prisma.round.findMany({
    where: { userId },
    include: {
      course: {
        select: { name: true, location: true }
      }
    },
    orderBy: { date: 'desc' }
  })

  // Map to match our Round interface
  const rounds = prismaRounds.map((round) => ({
    id: round.id,
    date: round.date,
    totalScore: round.totalScore,
    totalPar: round.totalPar,
    withFriends: round.withFriends,
    course: round.course,
    weather: round.weather,
    notes: round.notes,
  }))

  let kpiData: KPIData = {
    totalRounds: 0,
    bestScore: null,
    averageScore: null,
    handicap: null,
    friendsRoundsCount: 0,
  }

  if (rounds.length > 0) {
    const scores = rounds.map(r => r.totalScore)
    const bestScore = Math.min(...scores)
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const friendsRoundsCount = rounds.filter(r => r.withFriends).length

    kpiData = {
      totalRounds: rounds.length,
      bestScore,
      averageScore,
      handicap: averageScore, // Simplified handicap for now
      friendsRoundsCount,
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
