import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Mail, Calendar, MapPin, Trophy, Target } from 'lucide-react'
import { ProfileForm } from '@/components/profile/profile-form'
import { ProfileStats } from '@/components/profile/profile-stats'
import { redirect } from 'next/navigation'

async function getUserProfile(userId: string) {
  const { prisma } = await import('@/lib/prisma')
  
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: {
      rounds: {
        include: {
          course: true
        },
        orderBy: {
          date: 'desc'
        }
      }
    }
  })

  return profile
}

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getUserProfile(user.id)
  
  if (!profile) {
    redirect('/dashboard')
  }

  // Calculate stats
  const totalRounds = profile.rounds.length
  const averageScore = totalRounds > 0 
    ? Math.round(profile.rounds.reduce((sum, round) => sum + round.totalScore, 0) / totalRounds)
    : 0
  const bestScore = totalRounds > 0 
    ? Math.min(...profile.rounds.map(round => round.totalScore))
    : 0
  const coursesPlayed = new Set(profile.rounds.map(round => round.courseId)).size

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your profile and view your golf statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        {/* Golf Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Golf Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileStats 
              totalRounds={totalRounds}
              averageScore={averageScore}
              bestScore={bestScore}
              coursesPlayed={coursesPlayed}
            />
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email address cannot be changed. Contact support if needed.
              </p>
            </div>
            
            <div>
              <Label htmlFor="member-since">Member Since</Label>
              <Input
                id="member-since"
                value={new Date(profile.createdAt).toLocaleDateString()}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
