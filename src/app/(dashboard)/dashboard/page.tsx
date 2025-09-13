import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  // Load user's rounds from the database
  const rounds = await prisma.round.findMany({
    where: {
      userId: currentUser.id
    },
    include: {
      course: true,
      friends: {
        include: {
          friend: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: 20 // Get recent 20 rounds for dashboard
  })

  // Transform rounds to match the expected format
  const transformedRounds = rounds.map(round => ({
    id: round.id,
    date: round.date,
    totalScore: round.totalScore,
    totalPar: round.totalPar,
    withFriends: round.withFriends,
    course: {
      name: round.course.name,
      location: round.course.location
    },
    participants: round.friends.map(rf => ({
      friend: {
        firstName: rf.friend.firstName,
        lastName: rf.friend.lastName,
        email: rf.friend.email
      }
    }))
  }))

  // Calculate KPI data
  const totalRounds = rounds.length
  const scores = rounds.map(r => r.totalScore)
  const bestScore = scores.length > 0 ? Math.min(...scores) : null
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const friendsRoundsCount = rounds.filter(r => r.withFriends).length

  const kpiData = {
    totalRounds,
    bestScore,
    averageScore,
    handicap: averageScore, // Simplified handicap calculation
    friendsRoundsCount,
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back! Here&apos;s your golf performance overview.
        </p>
      </div>

      <DashboardClient initialRounds={transformedRounds} initialKPIData={kpiData} />
    </div>
  )
}
