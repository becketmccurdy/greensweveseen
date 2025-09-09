const { createClient } = require('@supabase/supabase-js')

// Test different user scenarios
async function testRLS() {
  // Initialize clients with different auth states
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const user1Client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
  
  const user2Client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )

  // Test cases
  await testPublicAccess(anonClient)
  await testUserAccess(user1Client, user2Client)
  await testFriendshipAccess(user1Client, user2Client)
}

async function testPublicAccess(client) {
  console.log('Testing public access...')
  
  // Should be able to read courses
  const { data: courses, error: coursesError } = await client
    .from('courses')
    .select('*')
  
  if (coursesError) console.error('Public course access failed:', coursesError)
  else console.log('Public can read courses:', courses.length)
  
  // Should NOT be able to read rounds
  const { error: roundsError } = await client
    .from('rounds')
    .select('*')
    .single()
  
  if (!roundsError) console.error('Public round access should be blocked')
  else console.log('Public cannot read rounds (expected)')
}

async function testUserAccess(user1, user2) {
  console.log('\nTesting user-specific access...')
  
  // Sign in users
  const { data: { user: user1Data }, error: user1Error } = await user1.auth.signInWithPassword({
    email: 'test1@example.com',
    password: 'password'
  })
  
  const { data: { user: user2Data }, error: user2Error } = await user2.auth.signInWithPassword({
    email: 'test2@example.com',
    password: 'password'
  })
  
  if (user1Error || user2Error) {
    console.error('Login failed:', user1Error || user2Error)
    return
  }
  
  // Create test data
  // Ensure a course exists owned by user1 (RLS requires createdById = auth.uid())
  const courseId = `test-course-${Date.now()}`
  await user1
    .from('courses')
    .insert({ id: courseId, name: 'Test Course', location: 'Testville', par: 72, createdById: user1Data.id })

  // Create a round for user1 on that course
  const roundId = `test-round-${Date.now()}`
  const { data: round1 } = await user1
    .from('rounds')
    .insert({ id: roundId, userId: user1Data.id, courseId: courseId, totalScore: 85, totalPar: 72, date: new Date().toISOString() })
    .select()
    .single()
  
  // Test access
  const { data: user1Rounds } = await user1
    .from('rounds')
    .select('*')
    .eq('userId', user1Data.id)
  
  console.log(`User1 can see their own rounds: ${user1Rounds.length}`)
  
  const { error: user2AccessError } = await user2
    .from('rounds')
    .select('*')
    .eq('id', round1.id)
    .single()
  
  if (!user2AccessError) console.error('User2 accessed User1\'s round (should be blocked)')
  else console.log('User2 cannot access User1\'s round (expected)')
}

async function testFriendshipAccess(user1, user2) {
  console.log('\nTesting friendship access...')
  
  // Create friendship
  const { data: u1 } = await user1.auth.getUser()
  const { data: u2 } = await user2.auth.getUser()
  const user1Id = u1?.user?.id
  const user2Id = u2?.user?.id
  const friendshipId = `test-fs-${Date.now()}`
  await user1
    .from('friendships')
    .insert({ id: friendshipId, userId: user1Id, friendId: user2Id, status: 'ACCEPTED' })
  
  // Create activity
  const activityId = `test-act-${Date.now()}`
  await user2
    .from('friend_activities')
    .insert({ id: activityId, userId: user2Id, type: 'ROUND_COMPLETED', data: {} })
  
  // Test access
  const { data: activities } = await user1
    .from('friend_activities')
    .select('*')
    
  console.log(`User1 can see friend activities: ${activities.length}`)
}

testRLS().catch(console.error)
