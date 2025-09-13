const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const popularCourses = [
  // Famous US Courses
  { name: "Augusta National Golf Club", location: "Augusta, GA", par: 72, latitude: 33.503, longitude: -82.020 },
  { name: "Pebble Beach Golf Links", location: "Pebble Beach, CA", par: 72, latitude: 36.566, longitude: -121.949 },
  { name: "St. Andrews Old Course", location: "St Andrews, Scotland", par: 72, latitude: 56.348, longitude: -2.8 },
  { name: "Pinehurst No. 2", location: "Pinehurst, NC", par: 70, latitude: 35.195, longitude: -79.468 },
  { name: "Bethpage Black", location: "Farmingdale, NY", par: 71, latitude: 40.746, longitude: -73.458 },
  { name: "TPC Sawgrass", location: "Ponte Vedra Beach, FL", par: 72, latitude: 30.198, longitude: -81.393 },
  { name: "Torrey Pines Golf Course", location: "La Jolla, CA", par: 72, latitude: 32.891, longitude: -117.252 },
  { name: "Whistling Straits", location: "Haven, WI", par: 72, latitude: 43.943, longitude: -87.718 },
  { name: "Oakmont Country Club", location: "Oakmont, PA", par: 70, latitude: 40.522, longitude: -79.838 },
  { name: "Merion Golf Club", location: "Ardmore, PA", par: 70, latitude: 40.006, longitude: -75.311 },
  
  // Popular Public Courses
  { name: "Kiawah Island Ocean Course", location: "Kiawah Island, SC", par: 72, latitude: 32.625, longitude: -80.045 },
  { name: "Bandon Dunes Golf Resort", location: "Bandon, OR", par: 72, latitude: 43.075, longitude: -124.402 },
  { name: "Spyglass Hill Golf Course", location: "Pebble Beach, CA", par: 72, latitude: 36.575, longitude: -121.955 },
  { name: "Half Moon Bay Golf Links", location: "Half Moon Bay, CA", par: 72, latitude: 37.443, longitude: -122.442 },
  { name: "Arcadia Bluffs Golf Club", location: "Arcadia, MI", par: 72, latitude: 44.497, longitude: -86.233 },
  
  // Major City Courses
  { name: "Bethpage Red", location: "Farmingdale, NY", par: 70, latitude: 40.747, longitude: -73.459 },
  { name: "Presidio Golf Course", location: "San Francisco, CA", par: 72, latitude: 37.792, longitude: -122.453 },
  { name: "Lincoln Park Golf Course", location: "San Francisco, CA", par: 68, latitude: 37.788, longitude: -122.505 },
  { name: "Griffith Park Golf Course", location: "Los Angeles, CA", par: 71, latitude: 34.130, longitude: -118.294 },
  { name: "Chambers Bay Golf Course", location: "University Place, WA", par: 72, latitude: 47.249, longitude: -122.580 },
  
  // Resort Courses
  { name: "TPC Scottsdale Stadium", location: "Scottsdale, AZ", par: 71, latitude: 33.606, longitude: -111.929 },
  { name: "Kapalua Plantation Course", location: "Kapalua, HI", par: 73, latitude: 20.998, longitude: -156.673 },
  { name: "Harbour Town Golf Links", location: "Hilton Head Island, SC", par: 71, latitude: 32.129, longitude: -80.817 },
  { name: "TPC Las Vegas", location: "Las Vegas, NV", par: 71, latitude: 36.057, longitude: -115.327 },
  { name: "Grayhawk Golf Club", location: "Scottsdale, AZ", par: 72, latitude: 33.669, longitude: -111.915 },
  
  // International
  { name: "Royal Melbourne Golf Club", location: "Melbourne, Australia", par: 71, latitude: -37.929, longitude: 145.026 },
  { name: "Carnoustie Golf Links", location: "Carnoustie, Scotland", par: 71, latitude: 56.502, longitude: -2.710 },
  { name: "Royal Birkdale Golf Club", location: "Southport, England", par: 70, latitude: 53.637, longitude: -3.050 },
  { name: "Muirfield Golf Links", location: "Gullane, Scotland", par: 71, latitude: 56.039, longitude: -2.814 },
  { name: "Cape Kidnappers Golf Course", location: "Hawke's Bay, New Zealand", par: 71, latitude: -39.647, longitude: 177.095 }
]

async function seedCourses() {
  console.log('🌱 Seeding popular golf courses...')
  
  let seedCount = 0
  
  for (const courseData of popularCourses) {
    try {
      // Check if course already exists
      const existingCourse = await prisma.course.findFirst({
        where: {
          name: courseData.name,
          location: courseData.location
        }
      })
      
      if (!existingCourse) {
        await prisma.course.create({
          data: {
            ...courseData,
            description: `World-renowned golf course located in ${courseData.location}`,
            createdById: null // System seeded courses
          }
        })
        seedCount++
        console.log(`✅ Added: ${courseData.name}`)
      } else {
        console.log(`⏭️  Skipped: ${courseData.name} (already exists)`)
      }
    } catch (error) {
      console.error(`❌ Failed to add ${courseData.name}:`, error)
    }
  }
  
  console.log(`🎉 Successfully seeded ${seedCount} new courses!`)
}

async function main() {
  try {
    await seedCourses()
  } catch (error) {
    console.error('Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })