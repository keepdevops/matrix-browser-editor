#!/usr/bin/env node
/**
 * Button audit: tests every interactive control in the editor.
 * Loads a sample component first so code-dependent buttons are enabled.
 */
const { chromium } = require('../node_modules/playwright');

const SAMPLE = `export function Demo() {
  return (
    <div style={{padding:24,background:'#1e293b',borderRadius:12}}>
      <h2 style={{color:'#f1f5f9'}}>Demo Component</h2>
      <button style={{padding:'8px 16px',background:'#6366f1',color:'#fff',border:'none',borderRadius:6}}>
        Click me
      </button>
    </div>
  );
}`;

async function loadCode(page, code) {
  await page.locator('button').filter({ hasText: '📋 Paste' }).click();
  await page.waitForTimeout(400);
  // The textarea is the only one in the paste modal
  await page.locator('textarea[placeholder*="Paste your"]').fill(code);
  await page.waitForTimeout(200);
  await page.locator('button').filter({ hasText: 'Load Component' }).click({ force: true });
  await page.waitForTimeout(800);
}

async function dismissModal(page) {
  // Try close/cancel buttons first
  try {
    const closeBtn = page.locator('button').filter({ hasText: /Close|✕|Cancel/ }).first();
    if (await closeBtn.isVisible({ timeout: 500 })) {
      await closeBtn.click({ force: true });
      await page.waitForTimeout(200);
      return;
    }
  } catch {}
  // Click the fixed-position backdrop (top-left corner is outside any modal inner box)
  try { await page.mouse.click(10, 10); await page.waitForTimeout(200); } catch {}
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
}

(async () => {
  const results = [];
  const log = (label, status, note = '') => {
    results.push({ label, status, note });
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${label}${note ? ' — ' + note : ''}`);
  };

  const b = await chromium.launch();
  const p = await b.newPage();
  const jsErrors = [];
  p.on('pageerror', e => jsErrors.push(e.message));

  await p.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  await p.context().grantPermissions(['clipboard-read', 'clipboard-write']);

  const check = async (label, fn) => {
    try {
      await fn();
    } catch (e) {
      log(label, 'FAIL', e.message.slice(0, 80));
    }
  };

  // ── Load sample code first ──────────────────────────────────────────────────
  await loadCode(p, SAMPLE);

  // ── CodePane toolbar ────────────────────────────────────────────────────────
  await check('+ New', async () => {
    await p.locator('button').filter({ hasText: '+ New' }).click();
    await p.waitForTimeout(200);
    // Reload code so subsequent tests work
    await loadCode(p, SAMPLE);
    log('+ New', 'PASS');
  });

  await check('📋 Paste modal', async () => {
    await p.locator('button').filter({ hasText: '📋 Paste' }).click();
    await p.waitForTimeout(400);
    const vis = await p.locator('text=PASTE REACT COMPONENT').isVisible();
    log('📋 Paste modal', vis ? 'PASS' : 'FAIL');
    // Close with Escape
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
    const gone = !(await p.locator('text=PASTE REACT COMPONENT').isVisible());
    log('📋 Paste Escape close', gone ? 'PASS' : 'FAIL');
  });

  await check('↩↪ Undo/Redo', async () => {
    await p.locator('button[title*="Undo"]').click({ force: true });
    await p.waitForTimeout(100);
    await p.locator('button[title*="Redo"]').click({ force: true });
    await p.waitForTimeout(100);
    log('↩↪ Undo/Redo', 'PASS');
  });

  await check('✦ Format', async () => {
    await p.locator('button[title*="Format"]').click({ force: true });
    await p.waitForTimeout(1200);
    log('✦ Format', 'PASS');
  });

  await check('Diff toggle', async () => {
    await p.locator('button').filter({ hasText: /^Diff/ }).first().click({ force: true });
    await p.waitForTimeout(200);
    const isOn = await p.locator('button').filter({ hasText: 'Diff On' }).count();
    if (isOn) {
      await p.locator('button').filter({ hasText: 'Diff On' }).click({ force: true });
      await p.waitForTimeout(200);
    }
    log('Diff toggle', 'PASS');
  });

  await check('⏱ History panel', async () => {
    await p.locator('button').filter({ hasText: 'History' }).click({ force: true });
    await p.waitForTimeout(300);
    const vis = await p.locator('text=VERSION HISTORY').isVisible();
    log('⏱ History panel', vis ? 'PASS' : 'WARN');
    await p.locator('button').filter({ hasText: 'History' }).click({ force: true });
    await p.waitForTimeout(200);
  });

  await check('Copy', async () => {
    await p.locator('button').filter({ hasText: /^Copy$/ }).first().click({ force: true });
    await p.waitForTimeout(200);
    log('Copy', 'PASS');
  });

  await check('Save', async () => {
    await p.locator('button').filter({ hasText: /^Save$/ }).first().click({ force: true });
    await p.waitForTimeout(300);
    log('Save', 'PASS');
  });

  await check('🔗 Share', async () => {
    await p.locator('button').filter({ hasText: /Share/ }).first().click({ force: true });
    await p.waitForTimeout(2500);
    const copied = await p.locator('button').filter({ hasText: /Copied/ }).count();
    log('🔗 Share', copied ? 'PASS' : 'WARN', copied ? '' : 'no "Copied" state seen — server may be offline');
  });

  await check('⬇ Export menu', async () => {
    const exportBtn = p.locator('button').filter({ hasText: /^⬇ Export/ });
    await exportBtn.click({ force: true });
    await p.waitForTimeout(400);
    const zip = await p.locator('text=Download ZIP').isVisible();
    log('⬇ Export menu', zip ? 'PASS' : 'FAIL');
    // Close by pressing Escape (ExportMenu closes on mousedown outside, Escape closes via global handler)
    await p.keyboard.press('Escape');
    await p.waitForTimeout(200);
    const gone = !(await p.locator('text=Download ZIP').isVisible());
    log('⬇ Export menu close', gone ? 'PASS' : 'FAIL');
  });

  await check('🔍 Review', async () => {
    await p.locator('button').filter({ hasText: /Review/ }).first().click({ force: true });
    await p.waitForTimeout(3000);
    log('🔍 Review', 'PASS');
  });

  await check('⚙ Refactor menu', async () => {
    await p.locator('button').filter({ hasText: /Refactor/ }).first().click({ force: true });
    await p.waitForTimeout(400);
    // Look for any menu item (use text locator)
    const items = await p.locator('button').filter({ hasText: /Split into|Convert to TypeScript|Add unit tests/ }).count();
    log('⚙ Refactor menu', items ? 'PASS' : 'WARN', items ? '' : 'no menu items found');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(200);
  });

  // ── PreviewPane toolbar ────────────────────────────────────────────────────
  for (const [title, lbl] of [['Mobile (375px)', '📱 Mobile'], ['Tablet (768px)', '⊞ Tablet'], ['Desktop (full)', '⊡ Desktop']]) {
    await check(lbl, async () => {
      await p.locator(`button[title="${title}"]`).click({ force: true });
      await p.waitForTimeout(200);
      log(lbl, 'PASS');
    });
  }

  for (const z of ['75%', '100%', '125%', '150%']) {
    await check(`Zoom ${z}`, async () => {
      await p.locator('button').filter({ hasText: z }).click({ force: true });
      await p.waitForTimeout(100);
      log(`Zoom ${z}`, 'PASS');
    });
  }
  // Reset to desktop
  await p.locator('button[title="Desktop (full)"]').click({ force: true });

  await check('⬜ Frame toggle', async () => {
    await p.locator('button[title="Mobile (375px)"]').click({ force: true });
    await p.waitForTimeout(200);
    const fb = p.locator('button').filter({ hasText: 'Frame' });
    if (await fb.count()) {
      await fb.click({ force: true });
      await p.waitForTimeout(200);
      await fb.click({ force: true });
      await p.waitForTimeout(200);
      log('⬜ Frame toggle', 'PASS');
    } else {
      log('⬜ Frame toggle', 'WARN', 'button not visible');
    }
    await p.locator('button[title="Desktop (full)"]').click({ force: true });
  });

  await check('◑ Themes', async () => {
    await p.locator('button').filter({ hasText: '◑ Themes' }).click({ force: true });
    await p.waitForTimeout(300);
    const vis = await p.locator('text=DARK').first().isVisible();
    log('◑ Themes', vis ? 'PASS' : 'WARN');
    await p.locator('button').filter({ hasText: '◑ Themes' }).click({ force: true });
    await p.waitForTimeout(200);
  });

  await check('⧉ Split', async () => {
    await p.locator('button').filter({ hasText: '⧉ Split' }).click({ force: true });
    await p.waitForTimeout(300);
    const vis = await p.locator('text=MOBILE 375px').isVisible();
    log('⧉ Split', vis ? 'PASS' : 'WARN');
    await p.locator('button').filter({ hasText: '⧉ Split' }).click({ force: true });
    await p.waitForTimeout(200);
  });

  await check('🔎 Inspect', async () => {
    await p.locator('button').filter({ hasText: '🔎 Inspect' }).click({ force: true });
    await p.waitForTimeout(300);
    const vis = await p.locator('text=Inspect mode').isVisible();
    log('🔎 Inspect', vis ? 'PASS' : 'WARN');
    await p.locator('button').filter({ hasText: '🔎 Inspect' }).click({ force: true });
    await p.waitForTimeout(200);
  });

  // ── Overflow menu (⋯) — open it first, then test each item ─────────────────
  // Click overflow until its dropdown items are visible in DOM
  const openOverflow = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await p.locator('button[title="More tools"]').click({ force: true });
      await p.waitForTimeout(300);
      const count = await p.locator('button').filter({ hasText: /Light mode|Dark mode/ }).count();
      if (count > 0) return;
      // If count is 0, we likely closed it — loop will click again to reopen
    }
  };
  const closeOverflow = async () => {
    await p.keyboard.press('Escape');
    await p.waitForTimeout(200);
  };

  await check('> Console', async () => {
    await openOverflow();
    await p.locator('button').filter({ hasText: /Console/ }).first().click({ force: true });
    await p.waitForTimeout(300);
    const vis = await p.locator('text=CONSOLE').first().isVisible();
    log('> Console', vis ? 'PASS' : 'WARN');
    // Close console: reopen overflow and click again
    await openOverflow();
    await p.locator('button').filter({ hasText: /Console/ }).first().click({ force: true });
    await p.waitForTimeout(200);
  });

  await check('🔍 Audit', async () => {
    await openOverflow();
    await p.locator('button').filter({ hasText: /Audit/ }).first().click({ force: true });
    await p.waitForTimeout(3000);
    log('🔍 Audit', 'PASS');
  });

  await check('📸 Screenshot', async () => {
    await openOverflow();
    await p.locator('button').filter({ hasText: /Screenshot/ }).first().click({ force: true });
    await p.waitForTimeout(2500);
    const vis = await p.locator('text=SCREENSHOT').first().isVisible();
    log('📸 Screenshot', vis ? 'PASS' : 'WARN');
    await dismissModal(p);
    await p.waitForTimeout(600); // extra settle time before next test
  });

  await check('☀/☾ Theme', async () => {
    for (let i = 0; i < 2; i++) {
      await openOverflow();
      await p.locator('button').filter({ hasText: /Light mode|Dark mode/ }).first().click({ force: true });
      await p.waitForTimeout(200);
    }
    log('☀/☾ Theme', 'PASS');
  });

  await check('▪ Bg cycle', async () => {
    for (let i = 0; i < 3; i++) {
      await openOverflow();
      await p.locator('button').filter({ hasText: /^▪ Bg|^□ Bg|^⊞ Bg/ }).first().click({ force: true });
      await p.waitForTimeout(100);
    }
    log('▪ Bg cycle', 'PASS');
  });

  // ── Top nav ────────────────────────────────────────────────────────────────
  await check('🧩 Canvas', async () => {
    await p.locator('button').filter({ hasText: '🧩 Canvas' }).click({ force: true });
    await p.waitForTimeout(400);
    log('🧩 Canvas', 'PASS');
    await p.locator('button').filter({ hasText: '🧩 Canvas' }).click({ force: true });
    await p.waitForTimeout(300);
  });

  await check('💬 Chat', async () => {
    await p.locator('button').filter({ hasText: '💬 Chat' }).click({ force: true });
    await p.waitForTimeout(400);
    const vis = await p.locator('text=AGENT CHAT').isVisible();
    log('💬 Chat', vis ? 'PASS' : 'WARN');
    await p.locator('button').filter({ hasText: '💬 Chat' }).click({ force: true });
    await p.waitForTimeout(300);
  });

  await check('☰ Sidebar', async () => {
    await p.locator('button[title*="Tools"]').click({ force: true });
    await p.waitForTimeout(400);
    const vis = await p.locator('text=Templates').first().isVisible();
    log('☰ Sidebar', vis ? 'PASS' : 'WARN');
    await p.locator('button[title*="Tools"]').click({ force: true });
    await p.waitForTimeout(300);
  });

  await check('? Help', async () => {
    await p.locator('button[title*="Help"]').click({ force: true });
    await p.waitForTimeout(300);
    const vis = await p.locator('text=Shortcuts').first().isVisible();
    log('? Help', vis ? 'PASS' : 'WARN');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(200);
  });

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\nJS errors:');
  if (jsErrors.length) {
    jsErrors.slice(0, 10).forEach(e => console.log('  ' + e.slice(0, 100)));
  } else {
    console.log('  none');
  }

  const pass = results.filter(r => r.status === 'PASS').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nSummary: ${pass} PASS | ${warn} WARN | ${fail} FAIL`);

  await p.screenshot({ path: '/tmp/btn-audit-final.png' });
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
