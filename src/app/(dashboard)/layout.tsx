'use client'

import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Navigation } from '@/components/navigation'
import { ErrorBoundary } from '@/components/error-boundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  const firstName = (user?.user_metadata?.name as string | undefined)?.split(' ')[0]
    || user?.email?.split('@')[0]
    || ''
  const lastName = (user?.user_metadata?.name as string | undefined)?.split(' ')[1] || ''
  const email = user?.email || ''

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
