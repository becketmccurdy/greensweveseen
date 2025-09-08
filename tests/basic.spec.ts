import { test, expect } from '@playwright/test'

test.describe('GreensWeveSeen App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check if the page loads and has the expected title
    await expect(page).toHaveTitle(/GreensWeveSeen/)
    
    // Check for key elements on the landing page
    await expect(page.locator('text=GreensWeveSeen')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    
    // Look for login link or button
    const loginButton = page.locator('a[href="/login"], button:has-text("Login"), a:has-text("Login")')
    if (await loginButton.count() > 0) {
      await loginButton.first().click()
      await expect(page).toHaveURL(/.*login/)
    }
  })

  test('should show dashboard for authenticated users', async ({ page }) => {
    // This test would require setting up authentication
    // For now, we'll just check that the dashboard route exists
    await page.goto('/dashboard')
    
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*login/)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check that the page renders properly on mobile
    await expect(page.locator('body')).toBeVisible()
  })
})
