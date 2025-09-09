import { randomBytes, createHash } from 'crypto'

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateInviteToken(): string {
  // Generate a URL-safe token for invite links
  return randomBytes(24).toString('base64url')
}