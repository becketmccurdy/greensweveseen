'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Plus, Users, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DashboardEmptyState() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Target className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to GreensWeveSeen!</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Start tracking your golf rounds to see your progress, analyze your performance, and connect with fellow golfers.
          </p>
          <Button 
            onClick={() => router.push('/rounds/new')} 
            size="lg"
            className="mb-4"
          >
            <Plus className="h-5 w-5 mr-2" />
            Record Your First Round
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/courses')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Explore Courses</h3>
                <p className="text-sm text-gray-600">Discover golf courses near you</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/friends')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connect with Friends</h3>
                <p className="text-sm text-gray-600">Invite friends and track together</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Tips */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Getting Started Tips</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Record your rounds</p>
                <p className="text-xs text-gray-600">Track your scores, courses, and playing conditions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Analyze your progress</p>
                <p className="text-xs text-gray-600">View your stats, trends, and improvements over time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Connect with friends</p>
                <p className="text-xs text-gray-600">Share your achievements and compete with fellow golfers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
