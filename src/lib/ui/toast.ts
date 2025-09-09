import { toast } from 'sonner'

export function success(message: string) {
  toast.success(message, {
    duration: 4000,
  })
}

export function error(err: Error | string) {
  const message = typeof err === 'string' ? err : err.message
  toast.error(message, {
    duration: 6000,
  })
}

export function info(message: string) {
  toast.info(message, {
    duration: 4000,
  })
}

export function loading(message: string) {
  return toast.loading(message)
}

export function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: Error) => string)
  }
) {
  return toast.promise(promise, messages)
}

// Convenience wrapper for common server action patterns
export function serverAction<T>(
  action: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error?: string | ((error: Error) => string)
  }
) {
  return promise(action, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error || 'Something went wrong. Please try again.',
  })
}