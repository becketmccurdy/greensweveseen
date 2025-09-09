import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3 } from 'lucide-react'

export function DashboardNoRounds() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to GreensWeveSeen!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Start tracking your golf rounds to see your progress, analyze your game, and compete with friends.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/rounds/new" prefetch={true}>
              <Plus className="h-5 w-5 mr-2" />
              Record Your First Round
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/courses" prefetch={true}>
              Explore Courses
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Record a Round</h3>
              <p className="text-sm text-gray-600">Track your scores hole-by-hole</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Analyze Stats</h3>
              <p className="text-sm text-gray-600">See your progress over time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Connect Friends</h3>
              <p className="text-sm text-gray-600">Compare scores and compete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}