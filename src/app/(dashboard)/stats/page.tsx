'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScoreTrendChart } from '@/components/stats/score-trend-chart'
import { ScoreDistributionChart } from '@/components/stats/score-distribution-chart'
import { MonthlyStatsChart } from '@/components/stats/monthly-stats-chart'
import { RecentRounds } from '@/components/stats/recent-rounds'
import { useRouter } from 'next/navigation'
import { Loader2, TrendingUp, Target, Trophy, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface StatsData {
  totalRounds: number
  averageScore: number
  bestScore: number
  worstScore: number
  handicap: number
  coursesPlayed: number
  scoreTrend: Array<{
    date: string
    score: number
    par: number
    course: string
    toPar: number
  }>
  scoreDistribution: Array<{
    range: string
    count: number
    percentage: number
  }>
  monthlyStats: Array<{
    month: string
    rounds: number
    totalScore: number
    averageScore: number
  }>
  recentRounds: Array<{
    id: string
    date: string
    score: number
    par: number
    toPar: number
    course: string
    weather: string | null
    notes: string | null
  }>
}

export default function StatsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadStats()
  }, [user, router, period])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/stats?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to load statistics')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading statistics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadStats}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalRounds === 0) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Statistics</h1>
          <p className="text-gray-600">Detailed insights into your golf performance</p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No rounds recorded yet. Start playing to see your stats!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Statistics</h1>
          <p className="text-gray-600">Detailed insights into your golf performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Period:</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRounds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.bestScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Handicap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.handicap.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Courses Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesPlayed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreTrendChart data={stats.scoreTrend} period={period} />
        <ScoreDistributionChart data={stats.scoreDistribution} />
      </div>

      <MonthlyStatsChart data={stats.monthlyStats} />

      {/* Recent Rounds */}
      <RecentRounds rounds={stats.recentRounds} />
    </div>
  )
}
