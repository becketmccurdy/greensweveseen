import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Fetch the current user if available so we can return ownership info
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const prisma = getPrisma()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const courses = q
      ? await prisma.course.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { location: { contains: q, mode: 'insensitive' } },
            ],
          },
          orderBy: { name: 'asc' },
          take: 100,
        })
      : await prisma.course.findMany({
          orderBy: { name: 'asc' },
          take: 100,
        })

    const shaped = courses.map((c: any) => ({
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
  const prisma = getPrisma()
  
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

    const latitude = body.latitude !== undefined ? Number(body.latitude) : null
    const longitude = body.longitude !== undefined ? Number(body.longitude) : null

    const course = await prisma.course.create({
      data: {
        name: body.name,
        location: body.location ?? null,
        par: typeof body.par === 'number' ? body.par : Number(body.par) || 72,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        createdById: user.id,
      }
    })

    // Try to set PostGIS geom if available
    if (latitude != null && longitude != null) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE courses SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
          longitude,
          latitude,
          course.id
        )
      } catch (e) {
        console.warn('Skipping geom update (PostGIS not available?):', e)
      }
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
