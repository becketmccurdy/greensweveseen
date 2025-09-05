'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { FriendsList } from '@/components/friends/friends-list'
import { SendFriendRequest } from '@/components/friends/send-friend-request'
import { FriendActivityFeed } from '@/components/friends/friend-activity-feed'

export const dynamic = 'force-dynamic'

export default function FriendsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleRequestSent = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!user) return null

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        <p className="text-gray-600">Connect with fellow golfers and track their progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SendFriendRequest onRequestSent={handleRequestSent} />
          <FriendsList key={refreshKey} user={user} />
        </div>
        <div>
          <FriendActivityFeed user={user} />
        </div>
      </div>
    </div>
  )
}
