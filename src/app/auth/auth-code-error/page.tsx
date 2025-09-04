import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-red-700">
            Authentication Error
          </CardTitle>
          <CardDescription>
            There was an error processing your authentication request.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            This could happen if:
          </p>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• The magic link has expired</li>
            <li>• The link was already used</li>
            <li>• There was a network issue</li>
          </ul>
          <Button asChild className="w-full">
            <Link href="/login">
              Try Again
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
