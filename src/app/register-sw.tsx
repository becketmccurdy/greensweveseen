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
      })
    }

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
    }).catch((err) => {
      console.error('SW registration failed:', err)
    })
  }, [])

  return null
}
