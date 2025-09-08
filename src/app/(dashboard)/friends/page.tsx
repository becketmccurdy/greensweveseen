import { FriendsList } from '@/components/friends/friends-list'
import { SendFriendRequest } from '@/components/friends/send-friend-request'
import { InviteFriend } from '@/components/friends/invite-friend'
import { FriendActivityFeed } from '@/components/friends/friend-activity-feed'
import { getUserProfile } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function FriendsPage() {
  const profile = await getUserProfile()

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        <p className="text-gray-600">Connect with fellow golfers and track their progress</p>
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
