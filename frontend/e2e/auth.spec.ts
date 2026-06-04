import { expect, test } from '@playwright/test'

const alice = {
  email: 'alice@example.com',
  password: 'Password123!',
}

test.describe('Authentication', () => {
  test('logs in with seed credentials and reaches home', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).fill(alice.email)
    await page.getByLabel(/password/i).fill(alice.password)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/home/)
    await expect(page.getByRole('heading', { name: /^home$/i })).toBeVisible()
    await expect(page.getByLabel(/what's happening/i)).toBeVisible()
  })

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).fill(alice.email)
    await page.getByLabel(/password/i).fill('wrong-password')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByRole('alert')).toContainText(/invalid credentials/i)
    await expect(page).toHaveURL(/\/login/)
  })
})
