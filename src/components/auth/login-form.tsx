'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleSignIn } from './google-sign-in'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}${nextPath}` }
        })
        if (error) {
          toast.error(error.message)
          return
        }
        toast.success('Magic link sent! Check your email to continue.')
      } else {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}${nextPath}` }
          })
          if (error) {
            toast.error(error.message)
            return
          }
          toast.success('Account created! Check your email to confirm.')
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) {
            toast.error(error.message)
            return
          }
          if (data.user) {
            toast.success('Signed in successfully!')
          }
        }
      }

      router.push(nextPath)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Google Sign In */}
      <GoogleSignIn />
      
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
      
      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {!useMagicLink && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!useMagicLink}
              minLength={6}
            />
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? 'Loading...'
            : useMagicLink
              ? 'Send Magic Link'
              : isSignUp
                ? 'Create Account'
                : 'Sign In'}
        </Button>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-green-600 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setUseMagicLink(!useMagicLink)}
            className="text-sm text-green-600 hover:underline"
          >
            {useMagicLink ? 'Use password instead' : 'Use magic link instead'}
          </button>
        </div>
      </form>
    </div>
  )
}
