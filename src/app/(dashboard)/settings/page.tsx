import { getUserProfile } from '@/lib/auth'
import { SettingsClient } from '@/components/settings/settings-client'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const profile = await getUserProfile()

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your account and preferences</p>
      </div>

      <SettingsClient profile={profile} />
    </div>
  )
}
