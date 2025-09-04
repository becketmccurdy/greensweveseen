'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { RecentRounds } from '@/components/dashboard/recent-rounds'
import { getRecentRounds, getRounds } from '@/lib/firestore'
import type { Round as FirestoreRound } from '@/lib/firestore'

interface KPIData {
  totalRounds: number
  bestScore: number | null
  averageScore: number | null
  handicap: number | null
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [recentRounds, setRecentRounds] = useState<any[]>([])
  const [kpiData, setKpiData] = useState<KPIData>({
    totalRounds: 0,
    bestScore: null,
    averageScore: null,
    handicap: null
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setDataLoading(true)
      
      // Load recent rounds
      const rounds = await getRecentRounds(user.uid, 5)
      setRecentRounds(rounds)
      
      // Load all rounds for KPI calculation
      const allRounds = await getRounds(user.uid)
      
      if (allRounds.length === 0) {
        setKpiData({
          totalRounds: 0,
          bestScore: null,
          averageScore: null,
          handicap: null
        })
      } else {
        const totalRounds = allRounds.length
        const scores = allRounds.map(r => r.score)
        const bestScore = Math.min(...scores)
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        
        setKpiData({
          totalRounds,
          bestScore,
          averageScore,
          handicap: averageScore // Simplified handicap calculation
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your golf performance and recent rounds
        </p>
      </div>
      
      {dataLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading your golf data...</div>
        </div>
      ) : (
        <>
          <KPICards {...kpiData} />
          <RecentRounds rounds={recentRounds} />
        </>
      )}
    </div>
  )
}
