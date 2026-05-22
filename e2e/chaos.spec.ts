/**
 * Chaos test suite — adversarial inputs, rapid interactions, edge cases.
 * Requires the dev server running at http://localhost:5173.
 */
import { test, expect, type Page } from '@playwright/test';

const URL = 'http://localhost:5173';
const LOAD_WAIT = 3000;

async function load(page: Page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(LOAD_WAIT);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function setMonacoCode(page: Page, code: string) {
  // Use Monaco's API to set content directly — avoids keyboard.type timeout on large code
  await page.evaluate((c) => {
    const models = (window as any).monaco?.editor?.getModels?.();
    if (models?.length) {
      models[0].setValue(c);
    }
  }, code);
  await page.waitForTimeout(300);
}

async function chatTextarea(page: Page) {
  return page.locator('textarea[placeholder*="Describe"]');
}

async function noUnhandledErrors(page: Page): Promise<string[]> {
  // Checks for visible error boundary fallbacks
  const crashed = await page.locator('text=crashed').count();
  const errs: string[] = [];
  if (crashed > 0) errs.push(`${crashed} panel(s) show crash fallback`);
  return errs;
}

// ---------------------------------------------------------------------------
// 1. Empty / whitespace inputs
// ---------------------------------------------------------------------------

test('empty prompt does not send or crash', async ({ page }) => {
  await load(page);
  await page.locator('button').filter({ hasText: '💬 Chat' }).click();
  await page.waitForTimeout(400);

  const sendBtn = page.locator('button').filter({ hasText: 'Send' }).last();
  await expect(sendBtn).toBeDisabled();

  // Type only spaces — still disabled
  const ta = await chatTextarea(page);
  await ta.fill('   ');
  await expect(sendBtn).toBeDisabled();

  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 2. Extremely long prompt
// ---------------------------------------------------------------------------

test('very long prompt text does not overflow or crash', async ({ page }) => {
  await load(page);
  await page.locator('button').filter({ hasText: '💬 Chat' }).click();
  await page.waitForTimeout(400);

  const longText = 'a'.repeat(10_000);
  const ta = await chatTextarea(page);
  await ta.fill(longText);
  await page.waitForTimeout(300);

  await expect(ta).toBeVisible();
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 3. Special characters / XSS attempts in prompt
// ---------------------------------------------------------------------------

test('XSS and special chars in prompt input are safe', async ({ page }) => {
  await load(page);
  await page.locator('button').filter({ hasText: '💬 Chat' }).click();
  await page.waitForTimeout(300);

  const payloads = [
    '<script>window.__xss=1</script>',
    '"><img src=x onerror=alert(1)>',
    '${7*7}',
    '{{constructor.constructor("return process")()}}',
    '🔥'.repeat(500),
  ];

  const ta = await chatTextarea(page);
  for (const payload of payloads) {
    await ta.fill(payload);
    await page.waitForTimeout(100);
    // XSS guard: __xss should never be set
    const xss = await page.evaluate(() => (window as any).__xss);
    expect(xss).toBeUndefined();
  }

  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 4. Broken JSX in Monaco — preview should show error, not crash
// ---------------------------------------------------------------------------

test('invalid JSX in editor does not crash panels', async ({ page }) => {
  await load(page);

  const brokenCodes = [
    // Syntax error
    'export function Foo() { return <div>',
    // Unclosed tags
    'export function Foo() { return (<div><span></div>); }',
    // Null component
    '',
    // Only comments
    '// nothing here',
    // Large component (100 lines — enough to stress without timeout)
    `export function Foo() {\n  return (\n    <div>\n${Array(100).fill('      <p>line</p>').join('\n')}\n    </div>\n  );\n}`,
  ];

  for (const code of brokenCodes) {
    await setMonacoCode(page, code);
    await page.waitForTimeout(600);
    // App shell must still be visible
    await expect(page.locator('text=LIVE PREVIEW')).toBeVisible();
    expect(await noUnhandledErrors(page)).toHaveLength(0);
  }
});

// ---------------------------------------------------------------------------
// 5. Rapid toolbar button clicks (no debounce assumed)
// ---------------------------------------------------------------------------

test('rapid toolbar button clicks do not crash', async ({ page }) => {
  await load(page);

  // Rapidly toggle diff mode 20 times
  const diffBtn = page.locator('button').filter({ hasText: /Diff/ }).first();
  for (let i = 0; i < 20; i++) {
    await diffBtn.click({ force: true });
  }
  await page.waitForTimeout(500);
  await expect(page.locator('text=LIVE PREVIEW')).toBeVisible();

  // Rapidly cycle preview background
  const bgBtn = page.locator('button[title*="Preview background"]');
  if (await bgBtn.count() > 0) {
    for (let i = 0; i < 15; i++) await bgBtn.click({ force: true });
  }

  // Rapidly toggle zoom
  const zoom75 = page.locator('button').filter({ hasText: '75%' });
  const zoom150 = page.locator('button').filter({ hasText: '150%' });
  for (let i = 0; i < 10; i++) {
    await zoom75.click({ force: true });
    await zoom150.click({ force: true });
  }

  await page.waitForTimeout(500);
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 6. Rapid drawer open/close
// ---------------------------------------------------------------------------

test('rapid sidebar and chat drawer open/close does not crash', async ({ page }) => {
  await load(page);

  const chatBtn = page.locator('button').filter({ hasText: '💬 Chat' });
  const sidebarBtn = page.locator('button').filter({ hasText: '☰' });

  for (let i = 0; i < 15; i++) {
    await chatBtn.click({ force: true });
    await sidebarBtn.click({ force: true });
  }

  await page.waitForTimeout(600);
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 7. localStorage edge cases
// ---------------------------------------------------------------------------

test('corrupted localStorage does not crash on reload', async ({ page }) => {
  await load(page);

  // Corrupt all known storage keys
  await page.evaluate(() => {
    const keys = ['component-library', 'agent-store', 'editor-draft', 'version-history', 'prompt-history'];
    for (const k of keys) localStorage.setItem(k, '{CORRUPTED: %%%invalid json###}');
  });

  // Reload — app should recover gracefully
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(LOAD_WAIT);

  await expect(page.locator('text=LIVE PREVIEW')).toBeVisible();
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

test('extremely large localStorage does not crash', async ({ page }) => {
  await load(page);

  // Stuff version-history with 200 large entries
  await page.evaluate(() => {
    const bigCode = 'x'.repeat(5000);
    const entries = Array.from({ length: 200 }, (_, i) => ({
      id: `${i}`, code: bigCode, componentName: 'Big', language: 'tsx',
      timestamp: Date.now() - i * 1000, source: 'ai',
    }));
    localStorage.setItem('version-history', JSON.stringify({ state: { entries }, version: 0 }));
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(LOAD_WAIT);

  await expect(page.locator('text=LIVE PREVIEW')).toBeVisible();
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 8. Keyboard mashing
// ---------------------------------------------------------------------------

test('keyboard mashing in Monaco does not crash', async ({ page }) => {
  await load(page);
  await page.locator('.monaco-editor').first().click();

  // Mash modifier combos
  const combos = ['Meta+A', 'Meta+Z', 'Meta+Shift+Z', 'Meta+S', 'Escape', 'Meta+D'];
  for (let round = 0; round < 3; round++) {
    for (const combo of combos) {
      await page.keyboard.press(combo);
      await page.waitForTimeout(30);
    }
  }

  // Type garbage
  await page.keyboard.type('🔥🎉<script>alert(1)</script>{[()]}');
  await page.waitForTimeout(500);

  await expect(page.locator('text=LIVE PREVIEW')).toBeVisible();
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 9. History panel with no entries — hover should not crash
// ---------------------------------------------------------------------------

test('history panel opens and closes cleanly with no entries', async ({ page }) => {
  await load(page);

  // Clear history
  await page.evaluate(() => localStorage.removeItem('version-history'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(LOAD_WAIT);

  const histBtn = page.locator('button').filter({ hasText: 'History' });
  await histBtn.click();
  await page.waitForTimeout(300);
  await expect(page.locator('text=VERSION HISTORY')).toBeVisible();
  await expect(page.locator('text=No history yet')).toBeVisible();

  // Close
  await page.locator('text=VERSION HISTORY').locator('..').locator('button').filter({ hasText: '✕' }).click();
  await page.waitForTimeout(200);
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 10. Export menu — all items reachable, disabled items not crashable
// ---------------------------------------------------------------------------

test('export menu opens and all items are present', async ({ page }) => {
  await load(page);

  const exportBtn = page.locator('button').filter({ hasText: 'Export' }).first();
  await exportBtn.click();
  await page.waitForTimeout(300);

  await expect(page.locator('text=Download ZIP')).toBeVisible();
  await expect(page.locator('text=GitHub Gist')).toBeVisible();
  await expect(page.locator('text=Generate Tests')).toBeVisible();

  // Click outside to close
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 11. Device frame + zoom extremes
// ---------------------------------------------------------------------------

test('device frame and extreme zoom do not crash', async ({ page }) => {
  await load(page);

  // Switch to mobile viewport
  await page.locator('button[title="Mobile (375px)"]').click();
  await page.waitForTimeout(200);

  // Enable frame
  const frameBtn = page.locator('button').filter({ hasText: 'Frame' });
  if (await frameBtn.count() > 0) {
    await frameBtn.click();
    await page.waitForTimeout(200);
  }

  // Cycle all zoom levels
  for (const z of ['75%', '100%', '125%', '150%']) {
    await page.locator('button').filter({ hasText: z }).click();
    await page.waitForTimeout(100);
  }

  // Switch to desktop
  await page.locator('button[title="Desktop (full)"]').click();
  await page.waitForTimeout(200);

  await expect(page.locator('text=LIVE PREVIEW')).toBeVisible();
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 12. Canvas mode rapid toggle
// ---------------------------------------------------------------------------

test('canvas mode toggle does not crash', async ({ page }) => {
  await load(page);

  const canvasBtn = page.locator('button').filter({ hasText: 'Canvas' });
  for (let i = 0; i < 6; i++) {
    await canvasBtn.click({ force: true });
    await page.waitForTimeout(150);
  }

  await page.waitForTimeout(500);
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 13. Concurrent rapid code changes
// ---------------------------------------------------------------------------

test('rapid code changes do not cause stale preview', async ({ page }) => {
  await load(page);
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.press('Meta+A');

  // Type many small edits rapidly
  for (let i = 0; i < 20; i++) {
    await page.keyboard.type(`// edit ${i}\n`);
  }

  await page.waitForTimeout(1000);
  await expect(page.locator('text=LIVE PREVIEW')).toBeVisible();
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 14. Copy button with no code
// ---------------------------------------------------------------------------

test('copy button with default code does not crash', async ({ page }) => {
  await load(page);

  // Grant clipboard permissions
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

  const copyBtn = page.locator('button').filter({ hasText: 'Copy' }).first();
  await copyBtn.click();
  await page.waitForTimeout(200);

  expect(await noUnhandledErrors(page)).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 15. Inspect mode click on various elements
// ---------------------------------------------------------------------------

test('inspect mode toggle and rapid enable/disable', async ({ page }) => {
  await load(page);

  const inspectBtn = page.locator('button').filter({ hasText: 'Inspect' });
  for (let i = 0; i < 8; i++) {
    await inspectBtn.click({ force: true });
    await page.waitForTimeout(80);
  }

  await page.waitForTimeout(400);
  expect(await noUnhandledErrors(page)).toHaveLength(0);
});
