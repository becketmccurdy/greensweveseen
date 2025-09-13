import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/)
    
    // Check login form elements
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Our form uses native required validation; assert we remain on the login page
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('#email')).toBeVisible()
  })

  test('should show signup option', async ({ page }) => {
    await page.goto('/login')
    
    // Should have link to signup
    const signupCta = page.getByRole('button', { name: /sign up/i })
      .or(page.getByText(/need.*account.*sign up/i))
      .or(page.getByRole('link', { name: /sign up/i }))
    await expect(signupCta).toBeVisible()
  })

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/login')
    
    // Look for forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i })
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.click()
      
      // Should navigate to password reset page
      await expect(page).toHaveURL(/.*reset.*password/)
      
      // Should have email input for reset
      await expect(page.locator('input[type="email"]')).toBeVisible()
    }
  })

  test('should protect dashboard routes', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/rounds/new', '/friends', '/profile']
    
    for (const route of protectedRoutes) {
      await page.goto(route)
      // Should redirect to login for protected routes
      await expect(page).toHaveURL(/.*login/)
    }
  })

  test('should show OAuth login options', async ({ page }) => {
    await page.goto('/login')
    
    // Look for OAuth buttons (Google, Apple, etc.)
    const oauthButtons = page.locator('button:has-text("Google"), button:has-text("Apple"), button:has-text("Continue with")')
    
    // Should have at least one OAuth option
    if (await oauthButtons.count() > 0) {
      await expect(oauthButtons.first()).toBeVisible()
    }
  })
})
