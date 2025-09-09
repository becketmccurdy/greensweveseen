import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Share2, Trophy } from 'lucide-react'

export function FriendsEmpty() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Users className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your Golf Network</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Connect with other golfers to compare scores, share achievements, and stay motivated together.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg">
          <UserPlus className="h-5 w-5 mr-2" />
          Invite Friends
        </Button>
        <Button variant="outline" size="lg">
          <Share2 className="h-5 w-5 mr-2" />
          Share Profile
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-left">Why Connect with Friends?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Friendly Competition</h4>
                <p className="text-sm text-gray-600">Compare scores and see who&apos;s improving fastest</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Share2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Share Achievements</h4>
                <p className="text-sm text-gray-600">Celebrate birdies, eagles, and personal bests</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Group Rounds</h4>
                <p className="text-sm text-gray-600">Track rounds played together with friends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Stay Motivated</h4>
                <p className="text-sm text-gray-600">Get inspired by your friends&apos; progress</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function FriendActivityEmpty() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Connect with friends to see their latest rounds and achievements here.
      </p>
      <Button>
        <UserPlus className="h-4 w-4 mr-2" />
        Invite Friends
      </Button>
    </div>
  )
}