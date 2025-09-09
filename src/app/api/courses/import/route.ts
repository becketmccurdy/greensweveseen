import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getGolfCourseAPIClient } from '@/lib/golf-course-api'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { externalId, source } = await request.json()

    if (!externalId || source !== 'golfcourseapi') {
      return NextResponse.json({ error: 'Invalid import request' }, { status: 400 })
    }

    // Check if course already exists in our database
    const existingCourse = await prisma.course.findFirst({
      where: {
        externalId: externalId.toString(),
        externalSource: 'golfcourseapi'
      }
    })

    if (existingCourse) {
      return NextResponse.json(existingCourse)
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
        address: courseData.address
      }
    })

    return NextResponse.json(newCourse)
  } catch (error) {
    console.error('Course import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
