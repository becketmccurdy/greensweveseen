import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RegisterSW } from './register-sw'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GreensWeveSeen - Golf Score Tracker',
  description: 'Track your golf scores and improve your game',
  manifest: '/manifest.json',
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
        {children}
        <RegisterSW />
      </body>
    </html>
  )
}
