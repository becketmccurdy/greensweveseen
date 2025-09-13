import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getGolfCourseAPIClient } from '@/lib/golf-course-api'

export async function POST(request: NextRequest) {
  const supabase = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { externalId, source } = await request.json()

    if (!externalId || source !== 'golfcourseapi') {
      return NextResponse.json({ error: 'Invalid import request' }, { status: 400 })
    }

    // Fetch course details from external API
    const golfAPI = getGolfCourseAPIClient()
    if (!golfAPI) {
      return NextResponse.json({ error: 'External API not configured' }, { status: 500 })
    }

    const apiCourse = await golfAPI.getCourseById(parseInt(externalId))
    if (!apiCourse) {
      return NextResponse.json({ error: 'Course not found in external API' }, { status: 404 })
    }

    // Check if course already exists in our database with better deduplication
    const courseName = apiCourse.course_name || apiCourse.club_name
    const courseLatitude = apiCourse.location.latitude
    const courseLongitude = apiCourse.location.longitude

    // Helper function to calculate distance between two points in km
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371 // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    // Helper function to normalize course names for better deduplication
    const normalizeName = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\b(golf|course|country|club|cc|gc)\b/g, '') // Remove common golf terms
        .replace(/\s+/g, ' ')
        .trim()
    }

    // First check for exact external ID match
    let existingCourse = await prisma.course.findFirst({
      where: {
        externalId: externalId.toString(),
        externalSource: 'golfcourseapi'
      }
    })

    if (existingCourse) {
      return NextResponse.json(existingCourse)
    }

    // Check for similar courses by name and location with improved deduplication
    const normalizedCourseName = normalizeName(courseName)
    const similarCourses = await prisma.course.findMany({
      where: {
        OR: [
          { name: { contains: courseName, mode: 'insensitive' } },
          { name: courseName } // Exact match
        ]
      }
    })

    // Enhanced duplicate detection within 100-200m radius
    if (courseLatitude && courseLongitude) {
      for (const similar of similarCourses) {
        if (similar.latitude && similar.longitude) {
          const distance = calculateDistance(
            courseLatitude, courseLongitude,
            similar.latitude, similar.longitude
          )

          // Within 100-200m and similar name - likely the same course
          if (distance < 0.2) {
            const normalizedExistingName = normalizeName(similar.name)

            // Check for name similarity using normalized names
            if (normalizedCourseName === normalizedExistingName ||
                normalizedCourseName.includes(normalizedExistingName) ||
                normalizedExistingName.includes(normalizedCourseName)) {
              return NextResponse.json(similar)
            }
          }
        }
      }
    }

    // Convert and save to our database
    const courseData = golfAPI.convertToLocalCourse(apiCourse)
    
    const newCourse = await prisma.course.create({
      data: {
        name: courseData.name,
        location: courseData.location,
        par: courseData.par,
        externalId: courseData.externalId,
        externalSource: courseData.externalSource,
        latitude: courseData.latitude,
        longitude: courseData.longitude,
        address: courseData.address,
        createdById: user.id
      }
    })

    return NextResponse.json(newCourse)
  } catch (error) {
    console.error('Course import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
