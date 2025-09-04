import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCourseSchema = z.object({
  name: z.string().min(1),
  location: z.string().nullable().optional(),
  par: z.number().min(60).max(80).default(72),
})

export async function POST(request: NextRequest) {
  try {
    await getUserProfile() // Ensure user is authenticated
    const body = await request.json()
    const data = createCourseSchema.parse(body)

    const course = await prisma.course.create({
      data: {
        name: data.name,
        location: data.location,
        par: data.par,
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
