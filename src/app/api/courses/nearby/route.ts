import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

// GET /api/courses/nearby?lat=..&lng=..&radius=25000
// Returns courses within radius (meters) ordered by distance
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radius = parseInt(searchParams.get('radius') || '25000', 10)

  if (!isFinite(lat) || !isFinite(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  try {
    const prisma = getPrisma()
    // Prefer PostGIS if geom exists
    const results = await prisma.$queryRaw<any[]>`
      SELECT id, name, location, par, latitude, longitude,
        CASE WHEN geom IS NOT NULL THEN
          ST_Distance(
            geom,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          )
        ELSE NULL END AS distance
      FROM courses
      WHERE geom IS NOT NULL
        AND ST_DWithin(
          geom,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radius}
        )
      ORDER BY distance ASC
      LIMIT 50;
    `

    return NextResponse.json(results)
  } catch (e) {
    console.error('Nearby courses query failed, falling back without PostGIS:', e)
    // Fallback without PostGIS: naive bounding box by ~radius degrees (~111km per degree)
    const deg = radius / 111000
    const prisma = getPrisma()
    const results = await prisma.course.findMany({
      where: {
        AND: [
          { latitude: { gte: lat - deg } },
          { latitude: { lte: lat + deg } },
          { longitude: { gte: lng - deg } },
          { longitude: { lte: lng + deg } },
        ]
      },
      orderBy: { name: 'asc' },
      take: 50,
    })
    return NextResponse.json(results)
  }
}
