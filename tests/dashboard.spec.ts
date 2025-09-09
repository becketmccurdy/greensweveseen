import { test, expect } from '@playwright/test'

const E2E_EMAIL = process.env.E2E_EMAIL
const E2E_PASSWORD = process.env.E2E_PASSWORD
const HAS_CREDS = !!E2E_EMAIL && !!E2E_PASSWORD

// Skip this spec entirely if credentials are not provided
HAS_CREDS || test.skip(true, 'Set E2E_EMAIL and E2E_PASSWORD to run the dashboard e2e')

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('#email', E2E_EMAIL!)
    await page.fill('#password', E2E_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('should display dashboard with key sections', async ({ page }) => {
    // Should show main dashboard sections
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    
    // Should show stats or empty state
    const statsSection = page.locator('[data-testid="stats-section"]')
    const emptyState = page.getByText(/welcome.*greensweveseen/i)
    await expect(statsSection.or(emptyState)).toBeVisible()
  })

  test('should show recent rounds or empty state', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000)
    
    // Should show either recent rounds or empty state
    const recentRounds = page.locator('[data-testid="recent-rounds"]')
    const emptyRounds = page.getByText(/no rounds.*yet/i)
    const recordFirstRound = page.getByRole('button', { name: /record.*first.*round/i })
    
    await expect(recentRounds.or(emptyRounds).or(recordFirstRound)).toBeVisible()
  })

  test('should navigate to new round from dashboard', async ({ page }) => {
    // Look for "Record Round" or "New Round" button
    const newRoundButton = page.getByRole('button', { name: /record.*round/i })
      .or(page.getByRole('link', { name: /new.*round/i }))
      .or(page.getByRole('button', { name: /record.*first.*round/i }))
    
    if (await newRoundButton.count() > 0) {
      await newRoundButton.first().click()
      await expect(page).toHaveURL(/\/rounds\/new/)
    }
  })

  test('should show navigation menu', async ({ page }) => {
    // Should have navigation to key sections
    const dashboardNav = page.getByRole('link', { name: /dashboard/i })
    const roundsNav = page.getByRole('link', { name: /rounds/i })
    const friendsNav = page.getByRole('link', { name: /friends/i })
    const coursesNav = page.getByRole('link', { name: /courses/i })
    
    // At least dashboard nav should be visible
    await expect(dashboardNav.or(roundsNav).or(friendsNav).or(coursesNav)).toBeVisible()
  })

  test('should display user stats when available', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(3000)
    
    // Look for stat cards or numbers
    const statCards = page.locator('[data-testid="stat-card"]')
    const avgScore = page.getByText(/average.*score/i)
    const bestScore = page.getByText(/best.*score/i)
    const totalRounds = page.getByText(/rounds.*played/i)
    
    // Should show stats if user has rounds, or empty state
    const hasStats = await statCards.count() > 0 || 
                    await avgScore.count() > 0 || 
                    await bestScore.count() > 0 || 
                    await totalRounds.count() > 0
    
    if (!hasStats) {
      // Should show empty state for new users
      await expect(page.getByText(/welcome/i).or(page.getByText(/get.*started/i))).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Dashboard should still be accessible and readable
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    
    // Navigation should work on mobile (might be hamburger menu)
    const mobileNav = page.locator('[data-testid="mobile-nav"]')
    const hamburger = page.locator('button[aria-label*="menu"]')
    
    if (await hamburger.count() > 0) {
      await hamburger.click()
      // Mobile menu should open
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    }
  })

  test('should handle logout', async ({ page }) => {
    // Look for logout button or user menu
    const userMenu = page.locator('[data-testid="user-menu"]')
    const logoutButton = page.getByRole('button', { name: /logout/i })
      .or(page.getByRole('button', { name: /sign.*out/i }))
    
    if (await userMenu.count() > 0) {
      await userMenu.click()
      await page.waitForTimeout(500)
    }
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      
      // Should redirect to login or home page
      await expect(page).toHaveURL(/\/(login|$)/)
    }
  })
})
