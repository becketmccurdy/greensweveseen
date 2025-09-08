import { getUserProfile } from '@/lib/auth'
import { SettingsClient } from '@/components/settings/settings-client'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const profile = await getUserProfile()

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <SettingsClient profile={profile} />
    </div>
  )
}
