import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GreensWeveSeen - Golf Score Tracker',
  description: 'Track your golf scores and improve your game',
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
          <main id="main-content">
            {children}
          </main>
          <footer className="mt-12 border-t">
            <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500 flex items-center justify-center">
              <p> {new Date().getFullYear()} GreensWeveSeen</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
