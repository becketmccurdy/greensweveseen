'use client'

import React from 'react'
import { Navigation } from '@/components/navigation'
import { useNavigation } from '@/contexts/navigation-context'
import { cn } from '@/lib/utils'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: {
    firstName: string | null
    lastName: string | null
    email: string
  }
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const { desktopCollapsed } = useNavigation()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      <main className={cn(
        "pb-16 md:pb-0 transition-all duration-300",
        desktopCollapsed ? "md:pl-16" : "md:pl-64"
      )}>
        {children}
      </main>
    </div>
  )
}