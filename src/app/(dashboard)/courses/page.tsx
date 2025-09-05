'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/auth-context'
import { CoursesList } from '@/components/courses/courses-list'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'

export default function CoursesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground">
          View and manage your golf courses
        </p>
      </div>

      <ErrorBoundary 
        fallbackRender={({ error, resetErrorBoundary }) => {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
          return (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <h3 className="text-lg font-medium text-destructive">
                  Failed to load courses
                </h3>
                <p className="text-sm text-destructive">
                  {errorMessage}
                </p>
                <button
                  onClick={() => resetErrorBoundary()}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )
        }}
      >
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <CoursesList />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
