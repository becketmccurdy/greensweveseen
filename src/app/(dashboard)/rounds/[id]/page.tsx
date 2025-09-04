import { getUserProfile } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Calendar, MapPin, Target, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { DeleteRoundButton } from '@/components/rounds/delete-round-button'

async function getRound(id: string, userId: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.round.findFirst({
    where: { 
      id,
      userId 
    },
    include: {
      course: true,
      scores: {
        orderBy: { hole: 'asc' }
      }
    }
  })
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RoundDetailPage({ params }: PageProps) {
  const { id } = await params
  const userProfile = await getUserProfile()
  const round = await getRound(id, userProfile.userId)

  if (!round) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Round Not Found</h1>
          <p className="text-gray-600 mb-4">This round doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const scoreToPar = round.totalScore - round.course.par
  const scoreColor = scoreToPar <= -2 ? 'text-green-600' : 
                   scoreToPar <= 0 ? 'text-blue-600' : 
                   scoreToPar <= 2 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{round.course.name}</h1>
          <p className="text-gray-600">Round Details</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/rounds/${round.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <DeleteRoundButton roundId={round.id} courseName={round.course.name} />
        </div>
      </div>

      {/* Round Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className={`text-2xl font-bold ${scoreColor}`}>
                  {round.totalScore}
                </p>
                <p className="text-sm text-gray-500">
                  {scoreToPar > 0 ? '+' : ''}{scoreToPar} to par
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Date Played</p>
                <p className="text-lg font-semibold">
                  {format(new Date(round.date), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(round.date), 'EEEE')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="text-lg font-semibold">{round.course.name}</p>
                {round.course.location && (
                  <p className="text-sm text-gray-500">{round.course.location}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hole-by-Hole Scores */}
      {round.scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Hole-by-Hole Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {round.scores.map((score) => {
                const holeToPar = score.strokes - score.par
                const holeColor = holeToPar <= -2 ? 'bg-green-100 text-green-800' :
                                holeToPar === -1 ? 'bg-blue-100 text-blue-800' :
                                holeToPar === 0 ? 'bg-gray-100 text-gray-800' :
                                holeToPar === 1 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                
                return (
                  <div key={score.hole} className={`p-2 rounded-lg text-center ${holeColor}`}>
                    <div className="text-xs font-medium">Hole {score.hole}</div>
                    <div className="text-lg font-bold">{score.strokes}</div>
                    <div className="text-xs">Par {score.par}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {round.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{round.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
