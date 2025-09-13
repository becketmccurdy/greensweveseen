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
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className={cn(
        "pb-16 md:pb-0 transition-all duration-300",
        desktopCollapsed ? "md:pl-24" : "md:pl-80"
      )}>
        <div className="pt-16 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}