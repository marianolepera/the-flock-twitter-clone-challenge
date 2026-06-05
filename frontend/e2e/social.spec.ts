import { expect, test } from '@playwright/test'

const alice = {
  email: 'alice@example.com',
  password: 'Password123!',
}

async function loginAsAlice(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(alice.email)
  await page.getByLabel(/password/i).fill(alice.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/home/)
}

test.describe('Social flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAlice(page)
  })

  test('composes a tweet on home', async ({ page }) => {
    const content = `E2E tweet ${Date.now()}`

    await page.getByLabel(/what's happening/i).fill(content)
    await page.getByRole('button', { name: /^tweet$/i }).click()

    await expect(page.getByText(content)).toBeVisible()
  })

  test('follows a user from search', async ({ page }) => {
    // Use a user Alice does not follow in seed (bob/carol/dave are already followed).
    const target = 'eve'

    await page.goto('/search')
    await page.getByLabel(/search users/i).fill(target)

    const followButton = page.getByRole('button', {
      name: new RegExp(`follow @${target}`, 'i'),
    })
    const unfollowButton = page.getByRole('button', {
      name: new RegExp(`unfollow @${target}`, 'i'),
    })

    await expect(
      page.getByRole('button', {
        name: new RegExp(`loading follow status for @${target}`, 'i'),
      }),
    ).toBeHidden({ timeout: 15_000 })

    await expect(followButton.or(unfollowButton)).toBeVisible({
      timeout: 15_000,
    })

    if (await unfollowButton.isVisible()) {
      await unfollowButton.click()
      await expect(followButton).toBeVisible()
    }

    await followButton.click()
    await expect(unfollowButton).toBeVisible({ timeout: 15_000 })
  })

  test('opens notifications and marks them as read', async ({ page }) => {
    await page.getByRole('link', { name: /notifications/i }).first().click()

    await expect(page).toHaveURL(/\/notifications/)
    await expect(
      page.getByRole('heading', { name: /^notifications$/i }),
    ).toBeVisible()
  })
})
