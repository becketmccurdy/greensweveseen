import { getUserProfile } from '@/lib/auth'
import { StatsClient } from '@/components/stats/stats-client'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const profile = await getUserProfile()

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Statistics</h1>
        <p className="text-gray-600">Detailed insights into your golf performance</p>
      </div>

      <StatsClient profile={profile} />
    </div>
  )
}
