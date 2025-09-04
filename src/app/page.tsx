import { redirect } from 'next/navigation'

async function getUser() {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
    return await getCurrentUser()
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export default async function HomePage() {
  const user = await getUser()
  
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
