import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  location: z.string().optional(),
  par: z.number().int().min(1).max(200).optional(),
  holes: z.number().int().min(1).max(36).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time dependency issues
    const { requireAuth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    
    const user = await requireAuth()
    const body = await request.json()
    
    const validatedData = createCourseSchema.parse(body)
    
    const course = await prisma.course.create({
      data: {
        ...validatedData,
        createdById: user.id,
      }
    })
    
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
