'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { RecentRounds } from '@/components/dashboard/recent-rounds'
import { EmptyDashboard } from '@/components/dashboard/empty-states'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'

interface KPIData {
  totalRounds: number
  bestScore: number | null
  averageScore: number | null
  handicap: number | null
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rounds, setRounds] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadRounds()
    }
  }, [user])

  const loadRounds = async () => {
    if (!user) return
    
    try {
      setDataLoading(true)
      // Fetch rounds from our Next.js API which authenticates via Supabase cookies
      const res = await fetch('/api/rounds', { cache: 'no-store' })
      if (!res.ok) {
        const msg = `Failed to load rounds (${res.status})`
        throw new Error(msg)
      }
      const userRounds = await res.json()
      setRounds(userRounds)
      setError(null)
    } catch (error) {
      console.error('Error loading rounds:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user) {
    return <DashboardSkeleton />
  }

  const recentRounds = rounds.slice(0, 5)

  let kpiData: KPIData = {
    totalRounds: 0,
    bestScore: null,
    averageScore: null,
    handicap: null,
  }

  if (rounds.length > 0) {
    const scores = rounds.map(r => r.totalScore)
    const bestScore = Math.min(...scores)
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    kpiData = {
      totalRounds: rounds.length,
      bestScore,
      averageScore,
      handicap: averageScore, // Simplified handicap for now
    }
  }

  if (dataLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your golf performance overview.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-destructive">
          {error}
        </div>
      )}

      <KPICards {...kpiData} />
      <RecentRounds rounds={recentRounds} />
    </div>
  )
}
