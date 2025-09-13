'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile as PrismaUserProfile } from '@prisma/client'

type UserProfile = PrismaUserProfile

interface SettingsClientProps {
  profile: UserProfile
}

export function SettingsClient({ profile: initialProfile }: SettingsClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: initialProfile.firstName || '',
    lastName: initialProfile.lastName || '',
    bio: initialProfile.bio || '',
    location: initialProfile.location || '',
    handicap: initialProfile.handicap?.toString() || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (formData.handicap && (isNaN(Number(formData.handicap)) || Number(formData.handicap) < 0 || Number(formData.handicap) > 54)) {
      newErrors.handicap = 'Handicap must be a number between 0 and 54'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setErrors({})

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          bio: formData.bio || null,
          location: formData.location || null,
          handicap: formData.handicap ? Number(formData.handicap) : null
        })
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        toast.success('Profile updated successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, firstName: e.target.value }))
                    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }))
                  }}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, lastName: e.target.value }))
                    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }))
                  }}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, bio: e.target.value }))
                  if (errors.bio) setErrors(prev => ({ ...prev, bio: '' }))
                }}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, location: e.target.value }))
                    if (errors.location) setErrors(prev => ({ ...prev, location: '' }))
                  }}
                  placeholder="City, State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="handicap">Handicap</Label>
                <Input
                  id="handicap"
                  type="number"
                  value={formData.handicap}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, handicap: e.target.value }))
                    if (errors.handicap) setErrors(prev => ({ ...prev, handicap: '' }))
                  }}
                  placeholder="0-54"
                  min="0"
                  max="54"
                  step="0.1"
                  className={errors.handicap ? 'border-red-500' : ''}
                />
                {errors.handicap && (
                  <p className="text-sm text-red-600">{errors.handicap}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{profile.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">User ID</label>
            <p className="text-gray-500 text-sm font-mono">{profile.userId}</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
