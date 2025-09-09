'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, TrendingUp, Target, Trophy, MapPin } from 'lucide-react'
import { MonthlyStatsChart } from './monthly-stats-chart'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

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

interface UserProfile {
  id: string
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  location: string | null
  handicap: number | null
  createdAt: Date
  updatedAt: Date
}

interface StatsClientProps {
  profile: UserProfile
}

export function StatsClient({ profile }: StatsClientProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
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
  }, [period])

  useEffect(() => {
    loadStats()
  }, [period, loadStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading statistics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadStats}>Try Again</Button>
      </div>
    )
  }

  if (!stats || stats.totalRounds === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No rounds recorded yet. Start playing to see your stats!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

      {/* KPI Cards */
      }
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

      {/* Monthly stats chart */}
      <MonthlyStatsChart data={stats.monthlyStats} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Score" />
                  <Line type="monotone" dataKey="par" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Par" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Rounds" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rounds */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentRounds.length === 0 ? (
            <p className="text-gray-500">No recent rounds</p>
          ) : (
            <div className="space-y-2">
              {stats.recentRounds.slice(0, 5).map((round) => (
                <div key={round.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{round.course}</span>
                    <span className="text-sm text-gray-500 ml-2">{new Date(round.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{round.score}</div>
                    <div className={`text-sm ${round.toPar > 0 ? 'text-red-600' : round.toPar < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {round.toPar > 0 ? '+' : ''}{round.toPar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
