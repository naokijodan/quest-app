import { test, expect } from '@playwright/test';
import { createTestUser, resetUserOnboarding, deleteTestUser } from './helpers/supabase-admin';

const SCREENSHOTS = '/Users/naokijodan/Desktop/quest-app/tests/e2e/screenshots';

test.describe('Animation & UI Visual Check', () => {
  test('landing page renders with RPG theme and particles', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/anim-01-landing.png`, fullPage: true });

    // Check RPG elements
    await expect(page.locator('text=Quest App')).toBeVisible();
    await expect(page.locator('.rpg-window').first()).toBeVisible();

    // Check font-dot-gothic class exists
    const dotGothic = page.locator('.font-dot-gothic').first();
    await expect(dotGothic).toBeVisible();
  });

  test('login page RPG UI with typewriter text', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS}/anim-02-login.png`, fullPage: true });

    // RPG window
    await expect(page.locator('.rpg-window').first()).toBeVisible();

    // Typewriter text should have rendered
    const typewriterEl = page.locator('text=冒険の書を開く');
    await expect(typewriterEl).toBeVisible({ timeout: 5000 });

    // Google login button
    await expect(page.locator('text=Googleでログイン')).toBeVisible();
  });

  test('register page RPG UI', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS}/anim-03-register.png`, fullPage: true });

    await expect(page.locator('.rpg-window').first()).toBeVisible();
    await expect(page.locator('text=新しい冒険者を登録')).toBeVisible({ timeout: 5000 });
  });

  test('authenticated home page with stagger animation and guild board', async ({ page }) => {
    const email = `e2e-anim-${Date.now()}@test.quest-app.local`;
    const password = 'TestPass123!';
    const username = `animtest_${Date.now().toString(36)}`;

    await createTestUser(email, password);

    try {
      // Login
      await page.goto('/login');
      await page.click('text=パスワードでログイン');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/onboarding', { timeout: 15000 });

      // Complete onboarding quickly
      await page.fill('input[placeholder="quester_123"]', username);
      await page.click('text=次へ');
      await page.waitForTimeout(300);
      await page.click('text=プランナー');
      await page.click('button:has-text("次へ")');
      await page.waitForTimeout(300);
      await page.click('text=ネコ');
      await page.click('button:has-text("完了")');
      await expect(page.locator('text=プロフィール作成完了')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: `${SCREENSHOTS}/anim-04-onboarding-complete.png` });

      // Go to home
      await page.goto('/');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOTS}/anim-05-home-guild.png`, fullPage: true });

      // Check stagger animation rendered (quest cards should be visible)
      const questCards = page.locator('.rpg-window');
      const count = await questCards.count();
      expect(count).toBeGreaterThan(2);

      // Check RPG HUD header
      await expect(page.locator('text=Quest App').first()).toBeVisible();
    } finally {
      await deleteTestUser(email);
    }
  });
});
