import React from 'react'
import { Navigation } from '@/components/navigation'
import { ErrorBoundary } from '@/components/error-boundary'
import { getCurrentUser } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    // This should be handled by middleware, but as a fallback
    return null
  }

  const firstName = currentUser.profile.firstName || currentUser.email?.split('@')[0] || ''
  const lastName = currentUser.profile.lastName || ''
  const email = currentUser.email || ''

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation user={{
          firstName,
          lastName,
          email
        }} />
        <main className="pb-16 md:pb-0 md:pl-64">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  )
}
