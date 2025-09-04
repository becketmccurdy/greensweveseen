import { NewRoundForm } from '@/components/rounds/new-round-form'
import { prisma } from '@/lib/prisma'

async function getCourses() {
  return await prisma.course.findMany({
    orderBy: { name: 'asc' },
  })
}

export default async function NewRoundPage() {
  const courses = await getCourses()

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">New Round</h1>
          <p className="text-gray-600 mt-1">Record your latest golf round</p>
        </div>
        
        <NewRoundForm courses={courses} />
      </div>
    </div>
  )
}
