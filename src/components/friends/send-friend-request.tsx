'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SendFriendRequestProps {
  onRequestSent: () => void
}

export function SendFriendRequest({ onRequestSent }: SendFriendRequestProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter an email address')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_request',
          friendEmail: email
        })
      })

      if (response.ok) {
        toast.success('Friend request sent successfully!')
        setEmail('')
        onRequestSent()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      setError(error instanceof Error ? error.message : 'Failed to send friend request')
      toast.error(error instanceof Error ? error.message : 'Failed to send friend request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Friend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Friend's Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              placeholder="friend@example.com"
              className={error ? 'border-red-500' : ''}
              required
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={!email || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Friend Request
              </>
            )}
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-3">
          Enter the email address of the person you want to add as a friend. 
          They'll receive a notification to accept your request.
        </p>
      </CardContent>
    </Card>
  )
}
