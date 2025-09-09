'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-4">GreensWeveSeen</div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">GreensWeveSeen</div>
        <div className="text-gray-600">Redirecting...</div>
      </div>
    </div>
  )
}
