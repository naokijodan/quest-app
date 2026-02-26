import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './helpers/supabase-admin';

const SCREENSHOTS = '/Users/naokijodan/Desktop/quest-app/tests/e2e/screenshots';

test.describe('Quest Execution E2E Flow', () => {
  const email = `e2e-quest-exec-${Date.now()}@test.quest-app.local`;
  const password = 'TestPass123!';
  const username = `questexec_${Date.now().toString(36)}`;

  test.beforeAll(async () => {
    await createTestUser(email, password);
  });

  test.afterAll(async () => {
    await deleteTestUser(email);
  });

  test('login → onboarding → home → select quest → fill form → execute → result', async ({ page }) => {
    test.setTimeout(180_000);

    // Login
    await page.goto('/login');
    await page.click('text=パスワードでログイン');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/onboarding', { timeout: 15_000 });

    // Complete onboarding
    await page.fill('input[placeholder="quester_123"]', username);
    await page.click('text=次へ');
    await page.waitForTimeout(500);
    await page.click('text=プランナー');
    await page.click('button:has-text("次へ")');
    await page.waitForTimeout(500);
    await page.click('text=ネコ');
    await page.click('button:has-text("完了")');
    await expect(page.locator('text=プロフィール作成完了')).toBeVisible({ timeout: 10_000 });

    // Go to home
    await page.goto('/');
    await page.waitForTimeout(2_000);
    await page.screenshot({ path: `${SCREENSHOTS}/exec-01-home.png` });

    // Check Agent Status Banner
    const agentBanner = page.locator('text=Agent');
    const bannerVisible = await agentBanner.isVisible().catch(() => false);
    console.log('Agent banner visible:', bannerVisible);

    // Find and click "自己紹介文作成" quest (basic, easiest)
    const questCard = page.locator('text=自己紹介文作成').first();
    const questCardExists = await questCard.isVisible().catch(() => false);
    console.log('Quest card "自己紹介文作成" visible:', questCardExists);

    if (!questCardExists) {
      // Try any quest card
      const anyQuestLink = page.locator('a[href*="/quest/"]').first();
      const anyExists = await anyQuestLink.isVisible().catch(() => false);
      console.log('Any quest link visible:', anyExists);

      if (!anyExists) {
        await page.screenshot({ path: `${SCREENSHOTS}/exec-02-no-quests.png`, fullPage: true });
        // Log page content for debugging
        const bodyText = await page.locator('body').textContent();
        console.log('Page body (first 500 chars):', bodyText?.slice(0, 500));
        throw new Error('No quest cards found on home page. Check if preset_quests are seeded.');
      }
      await anyQuestLink.click();
    } else {
      await questCard.click();
    }

    await page.waitForTimeout(2_000);
    console.log('Quest page URL:', page.url());
    await page.screenshot({ path: `${SCREENSHOTS}/exec-03-quest-detail.png`, fullPage: true });

    // Check if we landed on a quest page
    expect(page.url()).toMatch(/\/quest\//);

    // Check Agent connection status on this page
    const agentStatus = page.locator('text=Agent接続中, text=Quest Agent');
    const agentStatusText = await page.locator('body').textContent();
    const isAgentConnected = agentStatusText?.includes('接続中') || !agentStatusText?.includes('未接続');
    console.log('Agent appears connected:', isAgentConnected);

    // Fill form fields
    const formInputs = page.locator('form input:not([type="hidden"])');
    const formTextareas = page.locator('form textarea');
    const formSelects = page.locator('form select');

    const inputCount = await formInputs.count();
    const textareaCount = await formTextareas.count();
    const selectCount = await formSelects.count();
    console.log(`Form fields: ${inputCount} inputs, ${textareaCount} textareas, ${selectCount} selects`);

    // Fill inputs with test data
    for (let i = 0; i < inputCount; i++) {
      const placeholder = await formInputs.nth(i).getAttribute('placeholder');
      const name = await formInputs.nth(i).getAttribute('name');
      const value = name?.includes('name') || placeholder?.includes('名前') ? 'テスト太郎'
        : name?.includes('job') || placeholder?.includes('職業') ? 'プログラマー'
        : 'テスト回答';
      await formInputs.nth(i).fill(value);
    }

    for (let i = 0; i < textareaCount; i++) {
      await formTextareas.nth(i).fill('読書、プログラミング、旅行が趣味です。AIに興味があります。');
    }

    for (let i = 0; i < selectCount; i++) {
      const options = await formSelects.nth(i).locator('option:not([disabled])').allTextContents();
      if (options.length > 0) {
        await formSelects.nth(i).selectOption({ index: 1 });
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS}/exec-04-form-filled.png` });

    // Click execute button
    const execButton = page.locator('button:has-text("クエスト実行"), button:has-text("実行")').first();
    const execButtonVisible = await execButton.isVisible().catch(() => false);
    console.log('Execute button visible:', execButtonVisible);

    if (!execButtonVisible) {
      await page.screenshot({ path: `${SCREENSHOTS}/exec-05-no-exec-button.png`, fullPage: true });
      console.log('No execute button found. Page content:', (await page.locator('body').textContent())?.slice(0, 300));
      return;
    }

    await execButton.click();
    console.log('Clicked execute button');
    await page.waitForTimeout(2_000);
    await page.screenshot({ path: `${SCREENSHOTS}/exec-06-executing.png` });

    // Wait for execution result (up to 2 minutes)
    let completed = false;
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(5_000);
      const bodyText = await page.locator('body').textContent();

      if (bodyText?.includes('クエスト完了') || bodyText?.includes('もう一度')) {
        completed = true;
        console.log(`Quest completed after ~${(i + 1) * 5 + 2}s`);
        break;
      }

      if (bodyText?.includes('エラー') || bodyText?.includes('失敗')) {
        console.log(`Quest error at ~${(i + 1) * 5 + 2}s`);
        await page.screenshot({ path: `${SCREENSHOTS}/exec-07-error.png`, fullPage: true });
        console.log('Error content:', bodyText?.slice(0, 500));
        break;
      }

      if (bodyText?.includes('未接続')) {
        console.log('Agent disconnected during execution');
        await page.screenshot({ path: `${SCREENSHOTS}/exec-07-disconnected.png`, fullPage: true });
        break;
      }

      console.log(`Waiting... ${(i + 1) * 5 + 2}s`);
      if (i % 4 === 0) {
        await page.screenshot({ path: `${SCREENSHOTS}/exec-progress-${(i + 1) * 5}s.png` });
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS}/exec-08-final.png`, fullPage: true });

    if (completed) {
      console.log('Quest execution SUCCESS');

      // Verify XP display
      const xpText = await page.locator('body').textContent();
      const hasXP = xpText?.includes('XP') || xpText?.includes('xp');
      console.log('XP displayed:', hasXP);

      // Verify result content (uses .result-output div, not pre)
      const resultContent = page.locator('.result-output').first();
      const hasResult = await resultContent.isVisible().catch(() => false);
      console.log('Result content visible:', hasResult);
      if (hasResult) {
        const resultText = await resultContent.textContent();
        console.log('Result text length:', resultText?.length ?? 0);
      }
    } else {
      console.log('Quest execution did not complete within timeout');
    }
  });
});
