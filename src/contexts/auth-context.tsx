'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    try {
      const supabase = createClient()

      // Initialize session
      supabase.auth.getSession().then(({ data, error }) => {
        if (!mounted) return
        if (error) {
          console.error('Auth session error:', error)
        }
        setUser(data.session?.user ?? null)
        setLoading(false)
      }).catch((error) => {
        console.error('Auth getSession failed:', error)
        if (mounted) {
          setLoading(false)
        }
      })

      // Subscribe to auth state changes
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => {
        mounted = false
        sub.subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Auth context initialization error:', error)
      if (mounted) {
        setLoading(false)
      }
      // Return empty cleanup function in error case
      return () => {}
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
