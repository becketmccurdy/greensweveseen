import { getUserProfile } from '@/lib/auth'
import { EditRoundForm } from '@/components/rounds/edit-round-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

async function getCourses() {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.course.findMany({
    orderBy: { name: 'asc' }
  })
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditRoundPage({ params }: PageProps) {
  const { id } = await params
  const userProfile = await getUserProfile()
  const [round, courses] = await Promise.all([
    getRound(id, userProfile.userId),
    getCourses()
  ])

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Round</h1>
        <p className="text-gray-600">Update your round details</p>
      </div>

      <EditRoundForm round={round} courses={courses} />
    </div>
  )
}
