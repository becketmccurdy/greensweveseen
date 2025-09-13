import React from 'react'
import { Navigation } from '@/components/navigation'
import { ErrorBoundary } from '@/components/error-boundary'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NavigationProvider } from '@/contexts/navigation-context'
import { DashboardLayoutClient } from '@/components/dashboard-layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    const next = '/dashboard'
    return redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  const firstName = currentUser.profile.firstName || currentUser.email?.split('@')[0] || ''
  const lastName = currentUser.profile.lastName || ''
  const email = currentUser.email || ''

  return (
    <ErrorBoundary>
      <NavigationProvider>
        <DashboardLayoutClient user={{
          firstName,
          lastName,
          email
        }}>
          {children}
        </DashboardLayoutClient>
      </NavigationProvider>
    </ErrorBoundary>
  )
}
