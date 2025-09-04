'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteRoundButtonProps {
  roundId: string
  courseName: string
}

export function DeleteRoundButton({ roundId, courseName }: DeleteRoundButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/rounds/${roundId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        alert('Failed to delete round')
      }
    } catch (error) {
      alert('Failed to delete round')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (!showConfirm) {
    return (
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(false)}
        disabled={isDeleting}
      >
        Cancel
      </Button>
    </div>
  )
}
