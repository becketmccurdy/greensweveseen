'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Share2, Copy, Mail, Phone, Loader2, Link as LinkIcon, Check } from 'lucide-react'
import { toast } from 'sonner'

export function InviteFriend() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const createInvite = async () => {
    if (!email && !phone) {
      toast.error('Enter an email or phone number')
      return
    }

    setLoading(true)
    setCopied(false)
    try {
      const res = await fetch('/api/friends/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined, phone: phone || undefined })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create invite')
      }
      const data = await res.json()
      setInviteUrl(data.url)
      toast.success('Invite link created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create invite')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const webShare = async () => {
    if (!inviteUrl) return
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'Join me on GreensWeveSeen',
          text: 'Add me as a friend and track rounds together',
          url: inviteUrl,
        })
      } catch {
        // user canceled share
      }
    } else {
      copyLink()
    }
  }

  return (
    <Card data-testid="invite-friend">
      <CardHeader>
        <CardTitle>Invite Friends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inviteEmail">Email (optional)</Label>
            <Input id="inviteEmail" type="email" placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invitePhone">Phone (optional)</Label>
            <Input id="invitePhone" type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button 
            onClick={createInvite} 
            disabled={loading}
            aria-describedby="invite-help"
          >
            {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>) : (<><LinkIcon className="h-4 w-4 mr-2" />Generate Link</>)}
          </Button>
          <Button 
            variant="outline" 
            onClick={copyLink} 
            disabled={!inviteUrl}
            aria-label={copied ? "Link copied to clipboard" : "Copy invite link to clipboard"}
          >
            {copied ? (<><Check className="h-4 w-4 mr-2" />Copied</>) : (<><Copy className="h-4 w-4 mr-2" />Copy Link</>)}
          </Button>
          <Button 
            variant="outline" 
            onClick={webShare} 
            disabled={!inviteUrl}
            aria-label="Share invite link"
          >
            <Share2 className="h-4 w-4 mr-2" />Share
          </Button>
          <a href={inviteUrl ? `mailto:?subject=Join me on GreensWeveSeen&body=${encodeURIComponent(inviteUrl)}` : undefined}>
            <Button variant="ghost" disabled={!inviteUrl}><Mail className="h-4 w-4 mr-2" />Email</Button>
          </a>
          <a href={inviteUrl ? `sms:?body=${encodeURIComponent(inviteUrl)}` : undefined}>
            <Button variant="ghost" disabled={!inviteUrl}><Phone className="h-4 w-4 mr-2" />SMS</Button>
          </a>
        </div>

        <p id="invite-help" className="text-sm text-gray-600 mt-4">
          Enter an email or phone number to create a personalized invite link, or generate a general link to share.
        </p>

        {inviteUrl && (
          <p className="text-xs text-gray-500 mt-2 break-all">Invite URL: {inviteUrl}</p>
        )}
      </CardContent>
    </Card>
  )
}
