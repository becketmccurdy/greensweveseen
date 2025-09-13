import { DashboardClient } from '@/components/dashboard/dashboard-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function DashboardPage() {
  // Simplified version - load data client-side to isolate server issues
  const emptyKPIData = {
    totalRounds: 0,
    bestScore: null,
    averageScore: null,
    handicap: null,
    friendsRoundsCount: 0,
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back! Here&apos;s your golf performance overview.
        </p>
      </div>

      <DashboardClient initialRounds={[]} initialKPIData={emptyKPIData} />
    </div>
  )
}
