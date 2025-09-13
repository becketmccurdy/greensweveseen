import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CourseEditForm } from '@/components/courses/course-edit-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) return notFound()

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Course</h1>
        <CourseEditForm
          id={course.id}
          initialName={course.name}
          initialLocation={course.location}
          initialPar={course.par}
        />
      </div>
    </div>
  )
}
