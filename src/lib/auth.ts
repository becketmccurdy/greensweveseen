import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function getCurrentUser() {
  const user = await getUser()
  if (!user) return null
  
  let profile = await prisma.userProfile.findUnique({
    where: { userId: user.id }
  })

  // Create profile if it doesn't exist
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      }
    })
  }

  return { ...user, profile }
}

export async function getUserProfile() {
  const user = await requireAuth()
  
  let profile = await prisma.userProfile.findUnique({
    where: { userId: user.id }
  })

  // Create profile if it doesn't exist
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      }
    })
  }

  return profile
}
