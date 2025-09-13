import { FriendsList } from '@/components/friends/friends-list'
import { SendFriendRequest } from '@/components/friends/send-friend-request'
import { InviteFriend } from '@/components/friends/invite-friend'
import { FriendActivityFeed } from '@/components/friends/friend-activity-feed'
import { getUserProfile } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function FriendsPage() {
  const profile = await getUserProfile()

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Friends</h1>
        <p className="text-lg text-muted-foreground">Connect with fellow golfers and track their progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <InviteFriend />
          <SendFriendRequest />
          <FriendsList />
        </div>
        <div>
          <FriendActivityFeed />
        </div>
      </div>
    </div>
  )
}
