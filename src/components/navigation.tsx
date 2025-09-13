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
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 shadow-soft">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-golf-green">GreensWeveSeen</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hover:bg-golf-green-light/50"
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
          variant="outline"
          size="icon"
          onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          className="bg-background/95 backdrop-blur-sm shadow-soft hover:shadow-medium hover:bg-golf-green-light/50 border-border/50"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 bg-background/95 backdrop-blur-sm border-r border-border/50 transform transition-all duration-300 ease-in-out shadow-strong",
        "md:translate-x-0",
        desktopCollapsed ? "md:w-20" : "md:w-72",
        mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full",
        "md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-border/50 overflow-hidden">
            <h1 className={cn(
              "font-bold text-golf-green transition-all duration-300",
              desktopCollapsed ? "hidden md:hidden" : "text-xl"
            )}>
              {desktopCollapsed ? "G" : "GreensWeveSeen"}
            </h1>
            {desktopCollapsed && (
              <div className="hidden md:flex items-center justify-center text-2xl font-bold text-golf-green w-full">
                <div className="w-10 h-10 rounded-xl bg-golf-green-light flex items-center justify-center">
                  G
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group hover:scale-[1.02] active:scale-[0.98]",
                    isActive
                      ? "bg-golf-green-light text-golf-green shadow-soft"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    desktopCollapsed && "md:justify-center md:px-2"
                  )}
                  title={desktopCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    desktopCollapsed ? "md:mr-0" : "mr-3",
                    isActive ? "text-golf-green" : ""
                  )} />
                  <span className={cn(
                    "transition-all duration-300 font-medium",
                    desktopCollapsed && "md:hidden"
                  )}>
                    {item.name}
                  </span>
                  {/* Modern tooltip for collapsed state */}
                  {desktopCollapsed && (
                    <div className="hidden md:group-hover:flex absolute left-full ml-3 px-3 py-2 bg-foreground text-background text-sm rounded-lg whitespace-nowrap z-50 items-center shadow-strong">
                      {item.name}
                      <div className="absolute right-full w-0 h-0 border-4 border-transparent border-r-foreground" />
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User info and sign out */}
          <div className="border-t border-border/50 p-4">
            {!desktopCollapsed ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-golf-green-light rounded-xl flex items-center justify-center">
                      <span className="text-sm font-semibold text-golf-green">
                        {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.firstName || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <div className="hidden md:flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-golf-green-light rounded-xl flex items-center justify-center shadow-soft">
                  <span className="text-base font-semibold text-golf-green">
                    {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Mobile always shows full version */}
            <div className="md:hidden">
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-golf-green-light rounded-xl flex items-center justify-center">
                    <span className="text-sm font-semibold text-golf-green">
                      {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.firstName || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <LogOut className="mr-3 h-4 w-4" />
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
