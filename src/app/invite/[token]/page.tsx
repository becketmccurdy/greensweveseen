'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function InviteAcceptPage(props: any) {
  const [token, setToken] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'ready' | 'used' | 'invalid'>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // If not logged in, go to login and bounce back here after
  useEffect(() => {
    // Resolve params from Next.js 15 which may be a Promise
    ;(async () => {
      const raw = props?.params && typeof props.params.then === 'function' ? await props.params : props?.params
      const t = (raw || {}).token as string | undefined
      if (t) setToken(t)
    })()
  }, [props])

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(`/invite/${token ?? ''}`)
      router.push(`/login?next=${next}`)
    }
  }, [user, loading, router, token])

  useEffect(() => {
    async function load() {
      if (!user || !token) return
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
  }, [user, token])

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

  if (loading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Friend Invite</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          )}
          {status === 'invalid' && <p>This invite is invalid.</p>}
          {status === 'used' && <p>This invite was already used or expired.</p>}
          {status === 'ready' && (
            <div className="space-y-4">
              <p>Accept this invite{email ? ` from ${email}` : ''} to become friends.</p>
              <Button onClick={accept} disabled={busy}>
                {busy ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Accepting...</>) : (<><UserPlus className="h-4 w-4 mr-2" />Accept Invite</>)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
