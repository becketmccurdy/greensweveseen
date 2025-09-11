import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Fetch the current user if available so we can return ownership info
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.warn('Auth error in courses API:', authError)
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null
    const distance = searchParams.get('distance') ? parseInt(searchParams.get('distance')!) : null
    const sort = searchParams.get('sort') || 'name'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

    let courses: any[] = []
    
    // Add timeout wrapper for database operations
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), ms)
        )
      ])
    }

    // If we have coordinates and distance, use spatial search
    if (lat != null && lng != null && distance != null && isFinite(lat) && isFinite(lng)) {
      try {
        // Use PostGIS for spatial queries with optional text search
        const distanceMeters = distance * 1000 // Convert km to meters
        const textCondition = q ? `AND (LOWER(name) LIKE LOWER($4) OR LOWER(location) LIKE LOWER($4))` : ''
        const params = [lng, lat, distanceMeters, q ? `%${q}%` : undefined].filter(p => p !== undefined)
        
        const query = `
          SELECT id, name, location, par, holes, rating, slope, description, 
                 latitude, longitude, "createdById", "createdAt", "updatedAt",
                 CASE WHEN geom IS NOT NULL THEN
                   ST_Distance(
                     geom,
                     ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                   ) / 1000.0
                 ELSE NULL END AS distance_km
          FROM courses
          WHERE geom IS NOT NULL
            AND ST_DWithin(
              geom,
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
              $3
            )
            ${textCondition}
          ORDER BY ${sort === 'distance' ? 'distance_km ASC' : sort === 'name' ? 'name ASC' : 'name ASC'}
          LIMIT ${limit};
        `
        
        courses = await withTimeout(
          prisma.$queryRawUnsafe(query, ...params),
          8000 // 8 second timeout
        )
      } catch (e) {
        console.warn('PostGIS spatial query failed, falling back to simple filtering:', e)
        // Fallback to simple coordinate-based filtering
        const degreeDistance = distance / 111 // Rough conversion km to degrees
        const where: any = {
          AND: [
            { latitude: { gte: lat - degreeDistance, lte: lat + degreeDistance } },
            { longitude: { gte: lng - degreeDistance, lte: lng + degreeDistance } },
          ]
        }
        
        if (q) {
          where.AND.push({
            OR: [
              { name: { contains: q, mode: 'insensitive' as any } },
              { location: { contains: q, mode: 'insensitive' as any } },
            ]
          })
        }
        
        courses = await withTimeout(
          prisma.course.findMany({
            where,
            orderBy: sort === 'name' ? { name: 'asc' } : { name: 'asc' },
            take: limit,
          }),
          8000 // 8 second timeout
        )
      }
    } else {
      // Standard text-based search
      const where = q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as any } },
          { location: { contains: q, mode: 'insensitive' as any } },
        ]
      } : {}

      courses = await withTimeout(
        prisma.course.findMany({
          where,
          orderBy: sort === 'name' ? { name: 'asc' } : { name: 'asc' },
          take: limit,
        }),
        8000 // 8 second timeout
      )
    }

    const shaped = courses.map((c: any) => ({
      ...c,
      owned: user ? c.createdById === user.id : false,
      distance_km: c.distance_km || null,
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('Error fetching courses:', error)
    
    // Return empty array instead of 500 error to prevent client-side crashes
    // This allows the application to continue functioning even when DB is unavailable
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.warn('Auth error in course creation:', authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
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

    const latitude = body.latitude !== undefined ? Number(body.latitude) : null
    const longitude = body.longitude !== undefined ? Number(body.longitude) : null

    // Check for existing course by name and proximity if lat/lng provided
    if (latitude != null && longitude != null) {
      const threshold = 100 // meters
      try {
        const existing = await prisma.$queryRaw<any[]>`
          SELECT id, name, location, par, latitude, longitude 
          FROM courses 
          WHERE geom IS NOT NULL
            AND ST_DWithin(
              geom,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
              ${threshold}
            )
            AND LOWER(name) = LOWER(${body.name})
          LIMIT 1;
        `
        
        if (existing.length > 0) {
          // Return existing course instead of creating duplicate
          return NextResponse.json(existing[0])
        }
      } catch (e) {
        console.warn('PostGIS deduplication failed, proceeding with creation:', e)
      }
    }

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
  } catch (outerError) {
    console.error('Outer error in course creation:', outerError)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
