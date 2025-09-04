import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  handicap: z.number().nullable()
})

export async function PUT(request: NextRequest) {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const updatedProfile = await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        bio: validatedData.bio,
        location: validatedData.location,
        handicap: validatedData.handicap
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
