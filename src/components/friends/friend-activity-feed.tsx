'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, Zap, Star, Award, Loader2, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { FriendActivitySkeleton } from './friends-skeleton'
import { EmptyState } from '@/components/ui/empty-state'

interface Activity {
  id: string
  type: 'ROUND_COMPLETED' | 'PERSONAL_BEST' | 'HOLE_IN_ONE' | 'EAGLE' | 'BIRDIE' | 'COURSE_RECORD'
  data: any
  createdAt: string
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

interface FriendActivityFeedProps {
  user?: {
    id: string
    email?: string
  }
}

export function FriendActivityFeed({ user }: FriendActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/friends/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      } else {
        throw new Error('Failed to load activities')
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'ROUND_COMPLETED':
        return <Target className="h-4 w-4" />
      case 'PERSONAL_BEST':
        return <Trophy className="h-4 w-4" />
      case 'HOLE_IN_ONE':
        return <Star className="h-4 w-4" />
      case 'EAGLE':
        return <Zap className="h-4 w-4" />
      case 'BIRDIE':
        return <Award className="h-4 w-4" />
      case 'COURSE_RECORD':
        return <Trophy className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'ROUND_COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'PERSONAL_BEST':
        return 'bg-yellow-100 text-yellow-800'
      case 'HOLE_IN_ONE':
        return 'bg-purple-100 text-purple-800'
      case 'EAGLE':
        return 'bg-green-100 text-green-800'
      case 'BIRDIE':
        return 'bg-emerald-100 text-emerald-800'
      case 'COURSE_RECORD':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityMessage = (activity: Activity) => {
    const userName = activity.user.firstName && activity.user.lastName
      ? `${activity.user.firstName} ${activity.user.lastName}`
      : activity.user.email

    switch (activity.type) {
      case 'ROUND_COMPLETED':
        const score = activity.data.totalScore || activity.data.score
        return score ? `${userName} completed a round with a score of ${score}` : `${userName} completed a round`
      case 'PERSONAL_BEST':
        const pbScore = activity.data.totalScore || activity.data.score
        return pbScore ? `${userName} achieved a personal best score of ${pbScore}!` : `${userName} achieved a personal best!`
      case 'HOLE_IN_ONE':
        return `${userName} got a hole in one on hole ${activity.data.hole}!`
      case 'EAGLE':
        return `${userName} made an eagle on hole ${activity.data.hole}!`
      case 'BIRDIE':
        return `${userName} made a birdie on hole ${activity.data.hole}`
      case 'COURSE_RECORD':
        const crScore = activity.data.totalScore || activity.data.score
        return crScore ? `${userName} set a new course record with a score of ${crScore}!` : `${userName} set a new course record!`
      default:
        return `${userName} completed an activity`
    }
  }

  const getActivityBadge = (type: Activity['type']) => {
    const labels = {
      'ROUND_COMPLETED': 'Round',
      'PERSONAL_BEST': 'Personal Best',
      'HOLE_IN_ONE': 'Hole in One',
      'EAGLE': 'Eagle',
      'BIRDIE': 'Birdie',
      'COURSE_RECORD': 'Course Record'
    }

    return (
      <Badge className={getActivityColor(type)}>
        {getActivityIcon(type)}
        <span className="ml-1">{labels[type]}</span>
      </Badge>
    )
  }

  if (loading) {
    return <FriendActivitySkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No friend activity yet"
            description="When your friends complete rounds or achieve milestones, their activity will appear here."
          />
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getActivityMessage(activity)}
                    </p>
                    {getActivityBadge(activity.type)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
