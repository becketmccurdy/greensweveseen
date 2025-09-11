import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { getUserProfile } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

interface KPIData {
  totalRounds: number
  bestScore: number | null
  averageScore: number | null
  handicap: number | null
  friendsRoundsCount: number
}

async function getDashboardData(userId: string) {
  try {
    console.log('Fetching dashboard data for user:', userId)
    const prisma = getPrisma()
    
    console.log('Prisma client initialized, querying rounds...')
    const prismaRounds = await prisma.round.findMany({
      where: { userId },
      include: {
        course: {
          select: { name: true, location: true }
        }
      },
      orderBy: { date: 'desc' }
    })
    
    console.log(`Found ${prismaRounds.length} rounds for user`)

    // Map to match our Round interface
    const rounds = prismaRounds.map((round: any) => ({
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
      const scores = rounds.map((r: any) => r.totalScore)
      const bestScore = Math.min(...scores)
      const averageScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      const friendsRoundsCount = rounds.filter((r: any) => r.withFriends).length

      kpiData = {
        totalRounds: rounds.length,
        bestScore,
        averageScore,
        handicap: averageScore, // Simplified handicap for now
        friendsRoundsCount,
      }
    }

    console.log('Dashboard data compiled successfully')
    return { kpiData, rounds }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    console.error('Error details:', error instanceof Error ? error.stack : 'Unknown error')
    
    // Return empty data instead of crashing
    return {
      kpiData: {
        totalRounds: 0,
        bestScore: null,
        averageScore: null,
        handicap: null,
        friendsRoundsCount: 0,
      },
      rounds: []
    }
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function DashboardPage() {
  try {
    console.log('Dashboard page loading...')
    
    console.log('Getting user profile...')
    const profile = await getUserProfile()
    console.log('User profile obtained:', profile.userId)
    
    const { kpiData, rounds } = await getDashboardData(profile.userId)

    return (
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your golf performance overview.
          </p>
        </div>

        <DashboardClient initialRounds={rounds} initialKPIData={kpiData} />
      </div>
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('redirect')) {
      // Let the redirect happen
      throw error
    }
    
    // For other errors, show an error page instead of crashing
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600">Dashboard Error</h1>
          <p className="text-muted-foreground">
            There was an error loading your dashboard. Please try refreshing the page.
          </p>
          <p className="text-sm text-red-500 mt-2">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
}
