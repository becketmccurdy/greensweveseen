import { test, expect } from '@playwright/test'

const E2E_EMAIL = process.env.E2E_EMAIL
const E2E_PASSWORD = process.env.E2E_PASSWORD
const HAS_CREDS = !!E2E_EMAIL && !!E2E_PASSWORD

// Skip this spec entirely if credentials are not provided
HAS_CREDS || test.skip(true, 'Set E2E_EMAIL and E2E_PASSWORD to run the friends invite e2e')

test.describe('Friends Invite Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('#email', E2E_EMAIL!)
    await page.fill('#password', E2E_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('should navigate to friends page', async ({ page }) => {
    await page.goto('/friends')
    
    // Check page loads with expected elements
    await expect(page.getByRole('heading', { name: /friends/i })).toBeVisible()
    await expect(page.locator('[data-testid="invite-friend"]')).toBeVisible()
  })

  test('should create invite link with email', async ({ page }) => {
    await page.goto('/friends')
    
    // Fill in email for invite
    const emailInput = page.locator('#inviteEmail')
    await emailInput.fill('test@example.com')
    
    // Generate invite link
    await page.getByRole('button', { name: /generate link/i }).click()
    
    // Should show success and invite URL
    await expect(page.getByText(/invite url/i)).toBeVisible({ timeout: 10000 })
    
    // Copy button should be enabled
    const copyButton = page.getByRole('button', { name: /copy link/i })
    await expect(copyButton).toBeEnabled()
  })

  test('should create invite link with phone', async ({ page }) => {
    await page.goto('/friends')
    
    // Fill in phone for invite
    const phoneInput = page.locator('#invitePhone')
    await phoneInput.fill('(555) 123-4567')
    
    // Generate invite link
    await page.getByRole('button', { name: /generate link/i }).click()
    
    // Should show success and invite URL
    await expect(page.getByText(/invite url/i)).toBeVisible({ timeout: 10000 })
  })

  test('should create general invite link', async ({ page }) => {
    await page.goto('/friends')
    
    // Generate invite link without email/phone
    await page.getByRole('button', { name: /generate link/i }).click()
    
    // Should show success and invite URL
    await expect(page.getByText(/invite url/i)).toBeVisible({ timeout: 10000 })
    
    // Share buttons should be enabled
    const shareButton = page.getByRole('button', { name: /share/i })
    await expect(shareButton).toBeEnabled()
  })

  test('should copy invite link to clipboard', async ({ page }) => {
    await page.goto('/friends')
    
    // Generate invite link
    await page.getByRole('button', { name: /generate link/i }).click()
    await expect(page.getByText(/invite url/i)).toBeVisible({ timeout: 10000 })
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read'])
    
    // Click copy button
    const copyButton = page.getByRole('button', { name: /copy link/i })
    await copyButton.click()
    
    // Should show "Copied" feedback
    await expect(page.getByText(/copied/i)).toBeVisible()
  })

  test('should show friends list when user has friends', async ({ page }) => {
    await page.goto('/friends')
    
    // Wait for friends to load
    await page.waitForTimeout(2000)
    
    // Should show either friends list or empty state
    const friendsList = page.locator('[data-testid="friends-list"]')
    const emptyState = page.getByText(/no friends yet/i)
    
    await expect(friendsList.or(emptyState)).toBeVisible()
  })

  test('should show friend activity feed', async ({ page }) => {
    await page.goto('/friends')
    
    // Wait for activity to load
    await page.waitForTimeout(2000)
    
    // Should show either activity feed or empty state
    const activityFeed = page.locator('[data-testid="friend-activity-feed"]')
    const emptyActivity = page.getByText(/no recent activity/i)
    
    await expect(activityFeed.or(emptyActivity)).toBeVisible()
  })

  test('should handle invalid invite token', async ({ page }) => {
    // Navigate to invalid invite URL
    await page.goto('/invite/invalid-token-123')
    
    // Should show invalid invite message
    await expect(page.getByText(/invalid.*invite/i)).toBeVisible({ timeout: 10000 })
  })

  test('should scroll to invite form from empty state', async ({ page }) => {
    await page.goto('/friends')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Look for "Invite Friends" button in empty state
    const inviteFromEmpty = page.getByRole('button', { name: /invite friends/i })
    if (await inviteFromEmpty.count() > 0) {
      await inviteFromEmpty.click()
      
      // Should scroll to invite form
      await expect(page.locator('[data-testid="invite-friend"]')).toBeInViewport()
    }
  })
})
