'use client'

import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function FriendsPage() {
  const { user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        <p className="text-gray-600">Connect with fellow golfers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Friends functionality will be added in a future update. You'll be able to:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• Add friends and see their recent rounds</li>
            <li>• Compare your scores with friends</li>
            <li>• Challenge friends to rounds</li>
            <li>• Share your achievements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
