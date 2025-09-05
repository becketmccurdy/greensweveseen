import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch the current user if available so we can return ownership info
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const courses = await prisma.course.findMany({
      orderBy: { name: 'asc' }
    })

    const shaped = courses.map((c) => ({
      ...c,
      owned: user ? c.createdById === user.id : false,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  try {
    // Ensure a user profile exists for FK integrity
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        email: user.email || '',
      }
    })

    const course = await prisma.course.create({
      data: {
        name: body.name,
        location: body.location,
        par: typeof body.par === 'number' ? body.par : Number(body.par) || 72,
        createdById: user.id
      }
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
