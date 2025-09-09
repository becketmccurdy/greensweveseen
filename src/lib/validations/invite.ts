import { z } from 'zod'

export const createInviteSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number').optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone number is required',
  path: ['email']
})

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invalid token'),
})

const inviteActionSchema = z.object({
  action: z.literal('invite'),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number').optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone number is required',
  path: ['email']
})

export const friendActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('send_request'),
    friendEmail: z.string().email('Please enter a valid email address'),
  }),
  z.object({
    action: z.literal('accept'),
    friendshipId: z.string().min(1, 'Friendship ID is required'),
  }),
  z.object({
    action: z.literal('decline'),
    friendshipId: z.string().min(1, 'Friendship ID is required'),
  }),
  z.object({
    action: z.literal('remove'),
    friendshipId: z.string().min(1, 'Friendship ID is required'),
  }),
  z.object({
    action: z.literal('accept_invite'),
    token: z.string().min(1, 'Invalid token'),
  })
])

export type CreateInviteInput = z.infer<typeof createInviteSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>
export type FriendActionInput = z.infer<typeof friendActionSchema>