'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/auth-context'
import { getUserProfile, getRounds } from '../../../lib/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { User, Mail, Trophy } from 'lucide-react'
import type { UserProfile, Round } from '../../../lib/firestore'

interface ProfileStats {
  totalRounds: number
  averageScore: number
  bestScore: number
  coursesPlayed: number
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats>({
    totalRounds: 0,
    averageScore: 0,
    bestScore: 0,
    coursesPlayed: 0
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return
    
    try {
      setDataLoading(true)
      
      // Load profile
      const profileData = await getUserProfile(user.uid)
      setProfile(profileData)
      
      // Load rounds for stats
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
        const scores = rounds.map(r => r.score)
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
      console.error('Error loading profile data:', error)
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

  if (dataLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading your profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your profile and view your golf statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile?.name || user.displayName || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="handicap">Handicap</Label>
                <Input
                  id="handicap"
                  value={profile?.handicap?.toString() || '0'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Golf Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Golf Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Rounds:</span>
                <span className="font-semibold">{stats.totalRounds}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Score:</span>
                <span className="font-semibold">{stats.averageScore || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Best Score:</span>
                <span className="font-semibold">{stats.bestScore || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Courses Played:</span>
                <span className="font-semibold">{stats.coursesPlayed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email address cannot be changed. Contact support if needed.
              </p>
            </div>
            
            <div>
              <Label htmlFor="member-since">Member Since</Label>
              <Input
                id="member-since"
                value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
