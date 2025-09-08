import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getUserProfile } from '@/lib/auth'
import { InviteClient } from '@/components/invite/invite-client'

interface InviteAcceptPageProps {
  params: Promise<{ token: string }>
}

export default async function InviteAcceptPage({ params }: InviteAcceptPageProps) {
  const profile = await getUserProfile()
  const resolvedParams = await params
  const token = resolvedParams.token

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Friend Invite</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteClient token={token} profile={profile} />
        </CardContent>
      </Card>
    </div>
  )
}
