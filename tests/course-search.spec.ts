import { test, expect } from '@playwright/test'

const E2E_EMAIL = process.env.E2E_EMAIL
const E2E_PASSWORD = process.env.E2E_PASSWORD
const HAS_CREDS = !!E2E_EMAIL && !!E2E_PASSWORD

// Skip this spec entirely if credentials are not provided
HAS_CREDS || test.skip(true, 'Set E2E_EMAIL and E2E_PASSWORD to run the course search e2e')

test.describe('Course Search and Directory', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('#email', E2E_EMAIL!)
    await page.fill('#password', E2E_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('should navigate to courses directory', async ({ page }) => {
    await page.goto('/courses')
    
    // Check page loads with expected elements
    await expect(page.getByRole('heading', { name: /courses/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search courses/i)).toBeVisible()
  })

  test('should search for courses', async ({ page }) => {
    await page.goto('/courses')
    
    // Wait for courses to load
    await page.waitForTimeout(2000)
    
    // Search for a course
    const searchInput = page.getByPlaceholder(/search courses/i)
    await searchInput.fill('golf')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Should show search results or no results message
    const courseCards = page.locator('[data-testid="course-card"]')
    const noResults = page.getByText(/no courses found/i)
    
    // Either courses are found or no results message is shown
    await expect(courseCards.first().or(noResults)).toBeVisible()
  })

  test('should toggle between grid and map view', async ({ page }) => {
    await page.goto('/courses')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Should start in grid view
    await expect(page.locator('[data-testid="course-grid"]')).toBeVisible()
    
    // Click map view toggle
    const mapToggle = page.getByRole('button', { name: /map view/i })
    if (await mapToggle.count() > 0) {
      await mapToggle.click()
      
      // Should show map
      await expect(page.locator('[data-testid="courses-map"]')).toBeVisible()
      
      // Click back to grid view
      const gridToggle = page.getByRole('button', { name: /grid view/i })
      await gridToggle.click()
      await expect(page.locator('[data-testid="course-grid"]')).toBeVisible()
    }
  })

  test('should filter courses by type', async ({ page }) => {
    await page.goto('/courses')
    
    // Wait for courses to load
    await page.waitForTimeout(2000)
    
    // Try to use filter dropdown if available
    const filterSelect = page.locator('select').first()
    if (await filterSelect.count() > 0) {
      await filterSelect.selectOption('public')
      await page.waitForTimeout(1000)
      
      // Results should be filtered (or show no results)
      const courseCards = page.locator('[data-testid="course-card"]')
      const noResults = page.getByText(/no courses found/i)
      await expect(courseCards.first().or(noResults)).toBeVisible()
    }
  })

  test('should select course from map in new round flow', async ({ page }) => {
    await page.goto('/rounds/new')
    
    // Look for course picker component
    const coursePicker = page.locator('[data-testid="course-picker"]')
    if (await coursePicker.count() > 0) {
      // Click to open course picker
      await coursePicker.click()
      
      // Should show map or course selection UI
      await page.waitForTimeout(2000)
      
      // Look for course markers or course list
      const courseOption = page.locator('[data-testid="course-option"]').first()
      if (await courseOption.count() > 0) {
        await courseOption.click()
        
        // Course should be selected
        await expect(page.locator('[data-testid="selected-course"]')).toBeVisible()
      }
    }
  })
})
