import { NewRoundForm } from '@/components/rounds/new-round-form'

async function getCourses() {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.course.findMany({
    orderBy: { name: 'asc' }
  })
}

// Ensure this page is rendered dynamically at request time to avoid static export
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewRoundPage() {
  const courses = await getCourses()

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Round</h1>
          <p className="text-gray-600">Record your latest golf round</p>
        </div>

        <NewRoundForm courses={courses} />
      </div>
    </div>
  )
}
