import { test, expect } from '@playwright/test'

const E2E_EMAIL = process.env.E2E_EMAIL
const E2E_PASSWORD = process.env.E2E_PASSWORD
const HAS_CREDS = !!E2E_EMAIL && !!E2E_PASSWORD

// Skip this spec entirely if credentials are not provided
// Usage: E2E_EMAIL=you@example.com E2E_PASSWORD=yourpassword npm run e2e
HAS_CREDS || test.skip(true, 'Set E2E_EMAIL and E2E_PASSWORD to run the create round e2e')

test.describe('Create Round Flow', () => {
  test('login -> create course -> create round -> dashboard shows round', async ({ page }) => {
    const courseName = `Playwright Course ${Date.now()}`

    // Login
    await page.goto('/login')
    await page.fill('#email', E2E_EMAIL!)
    await page.fill('#password', E2E_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard$/)

    // Go to new round page
    await page.goto('/rounds/new')

    // Create a new course (avoids depending on existing data)
    await page.getByRole('button', { name: 'Add Course' }).click()
    await page.fill('#courseName', courseName)
    await page.fill('#courseLocation', 'Testville, TS')
    await page.fill('#coursePar', '72')
    await page.getByRole('button', { name: /create course/i }).click()

    // Fill round basics
    await page.fill('#score', '85')
    // Use today; input is type=date and expects yyyy-mm-dd
    const today = new Date().toISOString().slice(0, 10)
    await page.fill('#date', today)

    // Save round
    await page.getByRole('button', { name: /save round/i }).click()

    // Redirects to dashboard
    await expect(page).toHaveURL(/\/dashboard$/)

    // Assert the recent rounds shows the newly created course name
    await expect(page.getByText(courseName, { exact: false })).toBeVisible()
  })
})
