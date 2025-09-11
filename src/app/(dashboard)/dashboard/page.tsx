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
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your golf performance overview.
        </p>
      </div>

      <DashboardClient initialRounds={[]} initialKPIData={emptyKPIData} />
    </div>
  )
}
