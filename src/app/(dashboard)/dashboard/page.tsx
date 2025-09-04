'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { getRounds } from '@/lib/firestore'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { RecentRounds } from '@/components/dashboard/recent-rounds'
import { EmptyDashboard } from '@/components/dashboard/empty-states'

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
      const userRounds = await getRounds(user.uid)
      setRounds(userRounds)
    } catch (error) {
      console.error('Error loading rounds:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your golf performance overview.
        </p>
      </div>

      <KPICards {...kpiData} />
      <RecentRounds rounds={recentRounds} />
    </div>
  )
}
