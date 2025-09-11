'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function NewRoundError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('New Round Page Error:', {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      })
    }
  }, [error])

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-red-800">
              We encountered an error while loading the new round page. This could be due to a 
              temporary issue with our database or services.
            </p>
            
            {process.env.NODE_ENV === 'development' && error.digest && (
              <div className="p-3 bg-red-100 rounded-lg text-left">
                <p className="text-sm text-red-700 font-mono">
                  Error ID: {error.digest}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={reset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              <Button asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}