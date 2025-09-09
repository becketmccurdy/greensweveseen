// src/app/offline/page.tsx
'use client'

export default function OfflinePage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">You&apos;re offline</h1>
        <p className="text-gray-600">
          It looks like you&apos;re not connected to the internet. Some content may not be available.
        </p>
        <button
          className="px-4 py-2 rounded-lg bg-green-600 text-white"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </main>
  )
}
