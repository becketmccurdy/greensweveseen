'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  location: string | null
  handicap: number | null
  createdAt: Date
  updatedAt: Date
}

interface InviteClientProps {
  token: string
  profile: UserProfile
}

export function InviteClient({ token, profile }: InviteClientProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'ready' | 'used' | 'invalid'>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function load() {
      if (!profile || !token) return
      try {
        const res = await fetch(`/api/friends/invite/${token}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'PENDING') {
            setStatus('ready')
            setEmail(data.email || null)
          } else {
            setStatus('used')
          }
        } else {
          setStatus('invalid')
        }
      } catch {
        setStatus('invalid')
      }
    }
    load()
  }, [profile, token])

  const accept = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/friends/invite/${token}`, { method: 'POST' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to accept invite')
      }
      toast.success('Invite accepted – you are now friends!')
      router.push('/friends')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to accept invite')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (status === 'invalid') {
    return <p>This invite is invalid.</p>
  }

  if (status === 'used') {
    return <p>This invite was already used or expired.</p>
  }

  if (status === 'ready') {
    return (
      <div className="space-y-4">
        <p>Accept this invite{email ? ` from ${email}` : ''} to become friends.</p>
        <Button onClick={accept} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
              Accepting...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Accept Invite
            </>
          )}
        </Button>
      </div>
    )
  }

  return null
}
