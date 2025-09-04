import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RegisterSW } from './register-sw'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GreensWeveSeen - Golf Score Tracker',
  description: 'Track your golf scores and improve your game',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
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
    <html lang="en">
      <body className={inter.className}>
        <Toaster />
        {children}
        <RegisterSW />
      </body>
    </html>
  )
}
