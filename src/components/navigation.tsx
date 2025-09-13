'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNavigation } from '@/contexts/navigation-context'
import { 
  Home, 
  Plus, 
  BarChart3, 
  Users, 
  Settings, 
  Menu, 
  X,
  LogOut,
  MapPin,
  Map
} from 'lucide-react'

interface NavigationProps {
  user: {
    firstName: string | null
    lastName: string | null
    email: string
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'New Round', href: '/rounds/new', icon: Plus },
  { name: 'My Courses', href: '/my-courses', icon: MapPin },
  { name: 'Statistics', href: '/stats', icon: BarChart3 },
  { name: 'Friends', href: '/friends', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation({ user }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { desktopCollapsed, setDesktopCollapsed } = useNavigation()
  const pathname = usePathname()
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-green-700">GreensWeveSeen</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Desktop collapse button */}
      <div className="hidden md:block fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          className="bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out",
        "md:translate-x-0",
        desktopCollapsed ? "md:w-16" : "md:w-64",
        mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full",
        "md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200 overflow-hidden">
            <h1 className={cn(
              "font-bold text-green-700 transition-all duration-300",
              desktopCollapsed ? "hidden md:hidden" : "text-xl"
            )}>
              {desktopCollapsed ? "G" : "GreensWeveSeen"}
            </h1>
            {desktopCollapsed && (
              <div className="hidden md:block text-xl font-bold text-green-700 text-center w-full">
                G
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    desktopCollapsed && "md:justify-center md:px-2"
                  )}
                  title={desktopCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-all",
                    desktopCollapsed ? "md:mr-0" : "mr-3"
                  )} />
                  <span className={cn(
                    "transition-all duration-300",
                    desktopCollapsed && "md:hidden"
                  )}>
                    {item.name}
                  </span>
                  {/* Tooltip for collapsed state */}
                  {desktopCollapsed && (
                    <div className="hidden md:group-hover:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User info and sign out */}
          <div className="border-t border-gray-200 p-4">
            {!desktopCollapsed ? (
              <>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900">{user.firstName || user.email}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <div className="hidden md:flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-700">
                    {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Mobile always shows full version */}
            <div className="md:hidden">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">{user.firstName || user.email}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu spacer */}
      <div className="md:hidden h-16" />
    </>
  )
}
