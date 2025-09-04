// Create test data for development
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('Creating test user...')
    
    // Create or update test user
    const testUser = await prisma.userProfile.upsert({
      where: { userId: 'test-user' },
      update: {},
      create: {
        userId: 'test-user',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        bio: null,
        location: null,
        handicap: null,
      }
    })
    
    console.log('✅ Test user created:', testUser.email)
    
    // Create test courses
    const courses = [
      {
        name: 'Pebble Beach Golf Links',
        location: 'Pebble Beach, CA',
        par: 72,
        holes: 18,
        createdById: 'test-user'
      },
      {
        name: 'Augusta National Golf Club',
        location: 'Augusta, GA', 
        par: 72,
        holes: 18,
        createdById: 'test-user'
      },
      {
        name: 'St Andrews Old Course',
        location: 'St Andrews, Scotland',
        par: 72,
        holes: 18,
        createdById: 'test-user'
      }
    ]
    
    console.log('Creating test courses...')
    
    for (const courseData of courses) {
      try {
        const course = await prisma.course.create({
          data: courseData
        })
        console.log('✅ Course created:', course.name)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log('⏭️  Course already exists:', courseData.name)
        } else {
          throw error
        }
      }
    }
    
    console.log('\n🎉 Test data created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestData()
