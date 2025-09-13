import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) return notFound()

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Par {course.par}</Badge>
            {course.holes && <Badge variant="secondary">{course.holes} holes</Badge>}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {course.location && <p><span className="text-gray-500">Location:</span> {course.location}</p>}
            {course.rating && <p><span className="text-gray-500">Rating:</span> {course.rating}</p>}
            {course.slope && <p><span className="text-gray-500">Slope:</span> {course.slope}</p>}
            {course.latitude && course.longitude && (
              <p className="text-sm text-gray-500">{course.latitude.toFixed(4)}, {course.longitude.toFixed(4)}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Link href={`/courses/${course.id}/edit`}>
            <Button>Edit Course</Button>
          </Link>
          <Link href="/my-courses">
            <Button variant="outline">Back to My Courses</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
