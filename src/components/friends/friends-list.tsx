'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Check, X, Trash2, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { FriendsListSkeleton } from './friends-skeleton'
import { EmptyState } from '@/components/ui/empty-state'

interface Friend {
  id: string
  friend: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    handicap: number | null
  }
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED'
  isPending: boolean
  isAccepted: boolean
  isIncoming: boolean
  createdAt: string
}

interface FriendsListProps {
  user?: {
    id: string
    email?: string
  }
}

export function FriendsList({ user }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
      } else {
        throw new Error('Failed to load friends')
      }
    } catch (error) {
      console.error('Error loading friends:', error)
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, friendshipId: string) => {
    setActionLoading(friendshipId)
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, friendshipId })
      })

      if (response.ok) {
        toast.success(`Friend request ${action}ed successfully`)
        loadFriends()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} friend request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${action} friend request`)
    } finally {
      setActionLoading(null)
    }
  }

  const getFriendName = (friend: Friend['friend']) => {
    if (friend.firstName && friend.lastName) {
      return `${friend.firstName} ${friend.lastName}`
    }
    return friend.email
  }

  const getStatusBadge = (friend: Friend) => {
    if (friend.isAccepted) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Friends</Badge>
    }
    if (friend.isIncoming) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pending (Incoming)</Badge>
    }
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending (Sent)</Badge>
  }

  const getActionButtons = (friend: Friend) => {
    if (friend.isAccepted) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction('remove', friend.id)}
          disabled={actionLoading === friend.id}
        >
          {actionLoading === friend.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )
    }
    
    if (friend.isIncoming) {
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction('accept', friend.id)}
            disabled={actionLoading === friend.id}
          >
            {actionLoading === friend.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('decline', friend.id)}
            disabled={actionLoading === friend.id}
          >
            {actionLoading === friend.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    }
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction('remove', friend.id)}
        disabled={actionLoading === friend.id}
      >
        {actionLoading === friend.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Cancel'
        )}
      </Button>
    )
  }

  if (loading) {
    return <FriendsListSkeleton />
  }

  const acceptedFriends = friends.filter(f => f.isAccepted)
  const pendingFriends = friends.filter(f => f.isPending)

  return (
    <div className="space-y-6">
      {/* Accepted Friends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Friends ({acceptedFriends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {acceptedFriends.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No friends yet"
              description="Connect with fellow golfers to track their progress and share your achievements."
              action={{
                label: "Invite Friends",
                onClick: () => {
                  // Scroll to invite section
                  const inviteSection = document.querySelector('[data-testid="invite-friend"]')
                  inviteSection?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            />
          ) : (
            <div className="space-y-3">
              {acceptedFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{getFriendName(friend.friend)}</h3>
                      {getStatusBadge(friend)}
                    </div>
                    <p className="text-sm text-gray-500">{friend.friend.email}</p>
                    {friend.friend.handicap && (
                      <p className="text-sm text-gray-600">Handicap: {friend.friend.handicap}</p>
                    )}
                  </div>
                  {getActionButtons(friend)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingFriends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests ({pendingFriends.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{getFriendName(friend.friend)}</h3>
                      {getStatusBadge(friend)}
                    </div>
                    <p className="text-sm text-gray-500">{friend.friend.email}</p>
                  </div>
                  {getActionButtons(friend)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
