import { getUserProfile } from '@/lib/auth'
import { Navigation } from '@/components/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={profile} />
      <main className="pb-16 md:pb-0 md:pl-64">
        {children}
      </main>
    </div>
  )
}
