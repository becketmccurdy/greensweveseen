'use client'

import React, { createContext, useContext, useState } from 'react'

interface NavigationContextType {
  desktopCollapsed: boolean
  setDesktopCollapsed: (collapsed: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  return (
    <NavigationContext.Provider value={{ desktopCollapsed, setDesktopCollapsed }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}