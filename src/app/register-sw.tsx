// src/app/register-sw.tsx
'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const onUpdate = (registration: ServiceWorkerRegistration) => {
      if (!registration.waiting) return

      const doUpdate = () => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
        registration.waiting?.addEventListener('statechange', (e: any) => {
          if (e.target.state === 'activated') {
            window.location.reload()
          }
        })
      }

      toast('A new version is available', {
        action: {
          label: 'Update',
          onClick: doUpdate,
        },
        duration: 10000,
      })
    }

    const onOffline = () => {
      toast('You are now offline. Cached data will be used.', {
        duration: 5000,
      })
    }

    const onOnline = () => {
      toast('Connection restored! Syncing latest data...', {
        duration: 3000,
      })
    }

    // Register service worker
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for updates on load
      if (registration.waiting) onUpdate(registration)
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') onUpdate(registration)
        })
      })

      console.log('Service Worker registered successfully')
    }).catch((err) => {
      console.error('SW registration failed:', err)
    })

    // Online/offline event listeners
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)

    // Cleanup
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  return null
}
