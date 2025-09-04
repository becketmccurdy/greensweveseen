import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rounds = await prisma.round.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { date: 'desc' }
  })

  const stats = {
    totalRounds: rounds.length,
    bestScore: rounds.length > 0 ? Math.min(...rounds.map(r => r.totalScore)) : null,
    averageScore: rounds.length > 0 ? Math.round(rounds.reduce((sum, r) => sum + r.totalScore, 0) / rounds.length) : null,
    coursesPlayed: new Set(rounds.map(r => r.courseId)).size
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Statistics</h1>
        <p className="text-gray-600">Detailed insights into your golf performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRounds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Best Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestScore || '--'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore || '--'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Courses Played</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesPlayed}</div>
          </CardContent>
        </Card>
      </div>

      {rounds.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No rounds recorded yet. Start playing to see your stats!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
