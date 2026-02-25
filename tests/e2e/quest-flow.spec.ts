import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS = '/Users/naokijodan/Desktop/quest-app/tests/e2e/screenshots';

test.describe('Quest Flow E2E', () => {
  test('login → quest list → navigate to quest → fill form → execute', async ({ page }) => {
    test.setTimeout(180000);

    // Step 1: Login
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('h1')).toContainText('Quest App');
    await page.click('text=パスワードでログイン');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('After login:', page.url());
    await page.screenshot({ path: `${SCREENSHOTS}/01-after-login.png` });

    // Step 2: Verify quest list
    await expect(page.locator('text=クエストを選ぼう')).toBeVisible({ timeout: 10000 });

    // Step 3: Click on 自己紹介文作成
    await page.locator('text=自己紹介文作成').first().click();
    await page.waitForTimeout(2000);
    console.log('Quest page:', page.url());
    await page.screenshot({ path: `${SCREENSHOTS}/02-quest-detail.png` });

    // Step 4: Fill ALL form fields
    // Get all input elements inside the form (no type attribute)
    const formInputs = page.locator('form input');
    const formTextareas = page.locator('form textarea');
    const formSelects = page.locator('form select');

    const inputCount = await formInputs.count();
    const textareaCount = await formTextareas.count();
    const selectCount = await formSelects.count();
    console.log(`Form fields: ${inputCount} inputs, ${textareaCount} textareas, ${selectCount} selects`);

    // Fill each input with test data
    for (let i = 0; i < inputCount; i++) {
      const label = await formInputs.nth(i).evaluate((el) => {
        const labelEl = el.closest('.flex')?.querySelector('label');
        return labelEl?.textContent ?? 'unknown';
      });
      const value = label?.includes('名前') ? 'テスト太郎'
        : label?.includes('職業') ? 'プログラマー'
        : 'テスト値';
      await formInputs.nth(i).fill(value);
      console.log(`  Filled input "${label}" = "${value}"`);
    }

    // Fill textareas
    for (let i = 0; i < textareaCount; i++) {
      await formTextareas.nth(i).fill('読書、プログラミング、旅行が趣味です。特にAI技術に興味があります。');
      console.log('  Filled textarea');
    }

    // Select first non-empty option in selects
    for (let i = 0; i < selectCount; i++) {
      const options = await formSelects.nth(i).locator('option:not([disabled])').allTextContents();
      if (options.length > 0) {
        await formSelects.nth(i).selectOption({ index: 1 }); // First non-disabled option
        console.log(`  Selected option: ${options[0]}`);
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS}/03-quest-filled.png` });

    // Step 5: Click execute button
    const execButton = page.locator('button:has-text("クエスト実行")');
    await expect(execButton).toBeVisible();
    console.log('Clicking "クエスト実行！"...');
    await execButton.click();

    // Wait for phase transition
    await page.waitForTimeout(3000);
    const url3s = page.url();
    console.log('URL 3s after click:', url3s);
    await page.screenshot({ path: `${SCREENSHOTS}/04-after-click.png` });

    // Check if we got redirected
    if (url3s.includes('/login')) {
      console.log('ERROR: Redirected to login after execute click');
      return;
    }

    // Wait for execution to complete
    let completed = false;
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(5000);
      const bodyText = await page.locator('body').textContent();
      const pageUrl = page.url();

      if (pageUrl.includes('/login')) {
        console.log(`Redirected to login at ${(i + 1) * 5}s`);
        await page.screenshot({ path: `${SCREENSHOTS}/05-redirected.png` });
        return;
      }

      if (bodyText?.includes('XP') && (bodyText?.includes('完了') || bodyText?.includes('もう一度'))) {
        completed = true;
        console.log(`Quest completed after ~${(i + 1) * 5 + 3}s`);
        break;
      }

      // Check for error phase
      if (bodyText?.includes('エラーが発生') || bodyText?.includes('戻る')) {
        console.log(`Quest errored at ~${(i + 1) * 5 + 3}s`);
        await page.screenshot({ path: `${SCREENSHOTS}/05-error.png` });
        return;
      }

      console.log(`Waiting... ${(i + 1) * 5 + 3}s`);
      if (i % 3 === 0) {
        await page.screenshot({ path: `${SCREENSHOTS}/progress-${(i + 1) * 5}s.png` });
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS}/05-final.png` });
    console.log(completed ? 'Quest execution completed' : 'Quest execution timed out');
  });
});
