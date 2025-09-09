import { notFound, redirect } from 'next/navigation'
import { getPrisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RoundDetailsPage(props: any) {
  // Next.js 15 may pass params as a Promise; support both shapes
  const rawParams = props?.params && typeof props.params.then === 'function' ? await props.params : props?.params
  const params = (rawParams || {}) as { id: string }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const prisma = getPrisma()
  const round = await prisma.round.findFirst({
    where: { id: params.id, userId: user!.id },
    include: {
      course: true,
      scores: true,
    }
  })

  if (!round) {
    notFound()
  }

  const toPar = round.totalScore - round.totalPar
  const toParLabel = `${toPar > 0 ? '+' : ''}${toPar} to par`

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Round Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{round.course.name}</span>
            <span className="text-sm text-gray-500">Par {round.totalPar}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Date</div>
              <div className="flex items-center text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(round.date), 'PPP')}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Location</div>
              <div className="flex items-center text-gray-900">
                <MapPin className="h-4 w-4 mr-2" />
                {round.course.location || '—'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-gray-900 font-medium">
                {round.totalScore} <span className="text-gray-500">({toParLabel})</span>
              </div>
            </div>
          </div>

          {round.weather && (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Weather</div>
              <div className="text-gray-900">{round.weather}</div>
            </div>
          )}

          {round.notes && (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Notes</div>
              <div className="text-gray-900 whitespace-pre-wrap">{round.notes}</div>
            </div>
          )}

          {round.scores.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Hole-by-Hole</div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {round.scores.sort((a: any, b: any) => a.hole - b.hole).map((s: any) => (
                  <div key={s.id} className="rounded-md border p-2 text-sm flex items-center justify-between">
                    <span>H{s.hole}</span>
                    <span className="font-medium">{s.strokes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
