'use client'

import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Navigation } from '@/components/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{
        firstName: user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || '',
        lastName: user?.displayName?.split(' ')[1] || '',
        email: user?.email || ''
      }} />
      <main className="pb-16 md:pb-0 md:pl-64">
        {children}
      </main>
    </div>
  )
}
