import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGolfCourseAPIClient } from '@/lib/golf-course-api'

// Popular golf regions in the US
const POPULAR_REGIONS = [
  { state: 'CA', name: 'California' },
  { state: 'FL', name: 'Florida' },
  { state: 'TX', name: 'Texas' },
  { state: 'NY', name: 'New York' },
  { state: 'AZ', name: 'Arizona' },
  { state: 'NC', name: 'North Carolina' },
  { state: 'SC', name: 'South Carolina' },
  { state: 'GA', name: 'Georgia' },
  { state: 'NV', name: 'Nevada' },
  { state: 'CO', name: 'Colorado' }
]

export async function POST() {
  try {
    const golfAPI = getGolfCourseAPIClient()
    if (!golfAPI) {
      return NextResponse.json(
        { error: 'Golf Course API not configured' },
        { status: 500 }
      )
    }

    let totalImported = 0

    for (const region of POPULAR_REGIONS) {
      try {
        console.log(`Searching for courses in ${region.name}...`)
        const courses = await golfAPI.searchByState(region.state)

        // Import top courses from each state
        const topCourses = courses.slice(0, 10) // Top 10 per state

        for (const apiCourse of topCourses) {
          try {
            // Check if course already exists
            const existingCourse = await prisma.course.findFirst({
              where: {
                OR: [
                  { externalId: apiCourse.id.toString() },
                  {
                    name: apiCourse.course_name || apiCourse.club_name,
                    location: `${apiCourse.location.city}, ${apiCourse.location.state}`
                  }
                ]
              }
            })

            if (!existingCourse) {
              const courseData = golfAPI.convertToLocalCourse(apiCourse)

              await prisma.course.create({
                data: {
                  name: courseData.name,
                  location: courseData.location,
                  par: courseData.par,
                  latitude: courseData.latitude,
                  longitude: courseData.longitude,
                  address: courseData.address,
                  externalId: courseData.externalId,
                  externalSource: courseData.externalSource
                }
              })

              totalImported++
              console.log(`Imported: ${courseData.name}`)
            }
          } catch (courseError) {
            console.error(`Failed to import course ${apiCourse.course_name || apiCourse.club_name}:`, courseError)
          }
        }

        // Small delay between regions to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (regionError) {
        console.error(`Failed to search courses in ${region.name}:`, regionError)
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${totalImported} popular courses`,
      totalImported
    })

  } catch (error) {
    console.error('Course seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to seed popular courses' },
      { status: 500 }
    )
  }
}