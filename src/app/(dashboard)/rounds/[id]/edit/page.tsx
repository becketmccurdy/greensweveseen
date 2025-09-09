import { notFound, redirect } from 'next/navigation'
import { getPrisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { EditRoundForm } from '@/components/rounds/edit-round-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditRoundPage(props: any) {
  // Next.js 15 may pass params as a Promise; support both shapes
  const rawParams = props?.params && typeof props.params.then === 'function' ? await props.params : props?.params
  const params = (rawParams || {}) as { id: string }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const prisma = getPrisma()
  
  // Fetch the round to edit
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

  // Fetch all available courses for the dropdown
  const courses = await prisma.course.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/rounds/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Round
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Round</h1>
      </div>

      <EditRoundForm round={round} courses={courses} />
    </div>
  )
}
