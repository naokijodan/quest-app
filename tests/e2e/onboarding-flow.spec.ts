import { test, expect } from '@playwright/test';
import { createTestUser, resetUserOnboarding, deleteTestUser } from './helpers/supabase-admin';

const TEST_EMAIL = `e2e-onboarding-${Date.now()}@test.quest-app.local`;
const TEST_PASSWORD = 'TestPass123!';
const TEST_USERNAME = `tester_${Date.now().toString(36)}`;

test.describe('Onboarding → Chapter 0 → Home E2E Flow', () => {
  test.beforeAll(async () => {
    await createTestUser(TEST_EMAIL, TEST_PASSWORD);
  });

  test.afterAll(async () => {
    await deleteTestUser(TEST_EMAIL);
  });

  test('full onboarding flow: register → name → avatar → mascot → complete → chapter 0', async ({ page }) => {
    test.setTimeout(120_000);

    // Step 1: Login with test user
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Quest App', { timeout: 10_000 });

    // Switch to password mode
    await page.click('text=パスワードでログイン');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should redirect to onboarding (new user with no profile)
    await page.waitForURL('**/onboarding', { timeout: 15_000 });
    await expect(page.locator('text=冒険者の名前を決めよう')).toBeVisible({ timeout: 10_000 });

    // Step 2: Enter username
    await page.fill('input[placeholder="quester_123"]', TEST_USERNAME);
    await page.click('text=次へ');
    await page.waitForTimeout(500);

    // Step 3: Select avatar (planner)
    await expect(page.locator('text=キャラクタータイプを選ぼう')).toBeVisible({ timeout: 5_000 });
    await page.click('text=プランナー');
    await page.waitForTimeout(300);
    await page.click('button:has-text("次へ")');
    await page.waitForTimeout(500);

    // Step 4: Select mascot (cat)
    await expect(page.locator('text=相棒を選ぼう')).toBeVisible({ timeout: 5_000 });
    await page.click('text=ネコ');
    await page.waitForTimeout(300);
    await page.click('button:has-text("完了")');

    // Step 5: Verify completion screen
    await expect(page.locator('text=プロフィール作成完了')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(`text=${TEST_USERNAME}`)).toBeVisible();
    await expect(page.locator('text=プランナー')).toBeVisible();
    await expect(page.locator('text=ネコ')).toBeVisible();

    // Step 6: Click "旅の準備を始める" → Chapter 0
    await page.click('text=旅の準備を始める');
    await page.waitForURL('**/adventure/0/**', { timeout: 15_000 });

    // Verify we're on chapter 0 page
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();

    // Step 7: Navigate to home
    await page.goto('/');
    await page.waitForTimeout(3_000);

    // Verify home page shows quest board (authenticated + onboarding completed)
    const homeUrl = page.url();
    expect(homeUrl).not.toContain('/login');
    expect(homeUrl).not.toContain('/onboarding');

    // Should see quest board content or NPC
    const bodyText = await page.locator('body').textContent();
    const hasHomeContent =
      bodyText?.includes('クエスト') ||
      bodyText?.includes('冒険') ||
      bodyText?.includes('Quest App');
    expect(hasHomeContent).toBeTruthy();
  });

  test('unauthenticated user sees landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Quest App')).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user is redirected from protected routes', async ({ page }) => {
    await page.goto('/history');
    await page.waitForURL('**/login', { timeout: 10_000 });
  });
});
