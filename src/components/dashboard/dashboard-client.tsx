'use client'

import { useEffect } from 'react'
import { useRoundsStore } from '@/lib/stores/rounds-store'
import { KPICards } from './kpi-cards'
import { RecentRounds } from './recent-rounds'

interface Round {
  id: string
  date: Date
  totalScore: number
  totalPar: number
  course: {
    name: string
    location: string | null
  }
}

interface KPIData {
  totalRounds: number
  bestScore: number | null
  averageScore: number | null
  handicap: number | null
}

interface DashboardClientProps {
  initialRounds: Round[]
  initialKPIData: KPIData
}

export function DashboardClient({ initialRounds, initialKPIData }: DashboardClientProps) {
  const { rounds, setRounds } = useRoundsStore()

  // Initialize store with server data on mount
  useEffect(() => {
    setRounds(initialRounds)
  }, [initialRounds, setRounds])

  // Calculate KPIs from current rounds (including optimistic updates)
  const currentRounds = rounds.length > 0 ? rounds : initialRounds
  const recentRounds = currentRounds.slice(0, 5)

  let kpiData: KPIData = {
    totalRounds: 0,
    bestScore: null,
    averageScore: null,
    handicap: null,
  }

  if (currentRounds.length > 0) {
    const scores = currentRounds.map(r => r.totalScore)
    const bestScore = Math.min(...scores)
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    kpiData = {
      totalRounds: currentRounds.length,
      bestScore,
      averageScore,
      handicap: averageScore, // Simplified handicap for now
    }
  }

  return (
    <>
      <KPICards {...kpiData} />
      <RecentRounds rounds={recentRounds} />
    </>
  )
}
