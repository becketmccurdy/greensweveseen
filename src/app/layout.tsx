import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RegisterSW } from './register-sw'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GreensWeveSeen - Golf Score Tracker',
  description: 'Track your golf scores and improve your game',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ]
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Toaster />
          {children}
          <RegisterSW />
          <footer className="mt-12 border-t">
            <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} GreensWeveSeen</p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" prefetch className="hover:text-gray-700">Privacy Policy</Link>
                <Link href="/terms" prefetch className="hover:text-gray-700">Terms of Service</Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
