import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS = '/Users/naokijodan/Desktop/quest-app/tests/e2e/screenshots';

test.describe('Adventure Flow E2E', () => {
  test('login → adventure page → chapter 1 → first quest', async ({ page }) => {
    test.setTimeout(120000);

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.click('text=パスワードでログイン');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Navigate to adventure page
    await page.goto(`${BASE_URL}/adventure`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS}/adv-01-page.png` });

    const h1 = await page.locator('h1').textContent();
    console.log('Adventure page h1:', h1);

    // Check chapter cards are visible
    const chapters = page.locator('text=第1章');
    const ch1Visible = await chapters.isVisible();
    console.log('Chapter 1 visible:', ch1Visible);

    // Click on Chapter 1 link
    const ch1Link = page.locator('a[href*="/adventure/1/"]').first();
    if (await ch1Link.isVisible()) {
      console.log('Chapter 1 link found, clicking...');
      await ch1Link.click();
      await page.waitForTimeout(2000);
      console.log('Chapter 1 quest URL:', page.url());
      await page.screenshot({ path: `${SCREENSHOTS}/adv-02-quest.png` });

      // Check quest detail content
      const questTitle = await page.locator('h1').textContent();
      console.log('Quest title:', questTitle);

      // Check for story intro
      const storyIntro = page.locator('text=最初の, text=お使いを');
      if (await storyIntro.isVisible()) {
        console.log('Story intro found');
      }

      // Check form inputs
      const inputs = page.locator('form input, form textarea, form select');
      console.log('Form fields:', await inputs.count());
    } else {
      console.log('Chapter 1 link not found or locked');
      // Try clicking any chapter card
      const anyCard = page.locator('[class*="card"], [class*="Card"]').first();
      if (await anyCard.isVisible()) {
        await anyCard.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SCREENSHOTS}/adv-02-click-card.png` });
      }
    }
  });
});
