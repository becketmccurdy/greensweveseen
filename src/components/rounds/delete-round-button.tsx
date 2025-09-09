'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as toast from '@/lib/ui/toast'

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
    
    const deleteAction = fetch(`/api/rounds/${roundId}`, {
      method: 'DELETE',
    })

    try {
      await toast.serverAction(deleteAction, {
        loading: `Deleting round from ${courseName}...`,
        success: 'Round deleted successfully!',
        error: 'Failed to delete round. Please try again.',
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
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
