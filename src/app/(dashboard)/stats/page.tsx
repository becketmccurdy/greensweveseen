import { getUserProfile } from '@/lib/auth'
import { StatsClient } from '@/components/stats/stats-client'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const profile = await getUserProfile()

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Your Statistics</h1>
        <p className="text-lg text-muted-foreground">Detailed insights into your golf performance</p>
      </div>

      <StatsClient profile={profile} />
    </div>
  )
}
