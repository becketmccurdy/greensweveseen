'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRounds } from '@/lib/firestore'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Stats {
  totalRounds: number
  averageScore: number
  bestScore: number
  coursesPlayed: number
}

export default function StatsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalRounds: 0,
    averageScore: 0,
    bestScore: 0,
    coursesPlayed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadStats = async () => {
      try {
        const rounds = await getRounds(user.uid)
        
        if (rounds.length === 0) {
          setStats({
            totalRounds: 0,
            averageScore: 0,
            bestScore: 0,
            coursesPlayed: 0
          })
        } else {
          const totalRounds = rounds.length
          const scores = rounds.map(r => r.totalScore)
          const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          const bestScore = Math.min(...scores)
          const coursesPlayed = new Set(rounds.map(r => r.courseId)).size
          
          setStats({
            totalRounds,
            averageScore,
            bestScore,
            coursesPlayed
          })
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user, router])

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Statistics</h1>
        <p className="text-gray-600">Detailed insights into your golf performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRounds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Best Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestScore || '--'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore || '--'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Courses Played</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesPlayed}</div>
          </CardContent>
        </Card>
      </div>

      {stats.totalRounds === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No rounds recorded yet. Start playing to see your stats!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
