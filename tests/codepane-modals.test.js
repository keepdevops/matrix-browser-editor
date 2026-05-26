/**
 * CodePane modal tests.
 * Verifies Paste component modal, Inject into file modal, and
 * Version History panel open/close/clear flows.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function loadTemplate(b) {
  await b.eval(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.getBoundingClientRect().top < 50) { btn.click(); return; }
    }
  });
  await b.afterReact(500);
  await b.eval(() => {
    const els = Array.from(document.querySelectorAll('p, span, div'));
    const el = els.find(e => e.textContent.trim() === 'Analytics Dashboard');
    if (el) el.click();
  });
  await b.afterReact(2500);
  // Close sidebar
  await b.eval(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.getBoundingClientRect().top < 50) { btn.click(); return; }
    }
  });
  await b.afterReact(400);
}

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  try {
    await b.launch({ headless: true });
    await b.goto('/');
    await b.afterReact(800);
    await loadTemplate(b);

    // ── Paste component modal ─────────────────────────────────────────────────
    r.section('Paste component modal');

    const pasteBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Paste'))
    );
    if (pasteBtn) r.pass('Paste button present in toolbar');
    else r.fail('Paste button present in toolbar', 'not found');

    await b.eval(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Paste'));
      if (btn) btn.click();
    });
    await b.afterReact(400);

    const pasteModalOpen = await b.eval(() =>
      document.body.innerText.includes('PASTE REACT COMPONENT') ||
      document.body.innerText.includes('Paste React') ||
      !!document.querySelector('textarea[placeholder*="Paste"]')
    );
    if (pasteModalOpen) r.pass('Paste modal opens');
    else r.fail('Paste modal opens', 'modal content not found');

    const pasteTextarea = await b.exists('textarea[placeholder*="Paste"], textarea[placeholder*="paste"]');
    if (pasteTextarea) r.pass('Paste textarea rendered in modal');
    else r.fail('Paste textarea rendered in modal', 'no textarea found');

    // Load Component button disabled when empty
    const loadBtnDisabled = await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const load = btns.find(b => b.textContent.includes('Load Component'));
      return load ? load.disabled : null;
    });
    if (loadBtnDisabled) r.pass('Load Component button disabled when textarea is empty');
    else r.fail('Load Component button disabled when textarea is empty', `disabled=${loadBtnDisabled}`);

    // Fill paste textarea via locator (handles React synthetic events)
    await b.page.locator('textarea[placeholder*="Paste"]').fill(
      'export function MyComp() { return <div>test</div>; }'
    );
    await b.afterReact(400);
    const loadBtnEnabled = await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const load = btns.find(b => b.textContent.includes('Load Component'));
      return load ? !load.disabled : false;
    });
    if (loadBtnEnabled) r.pass('Load Component button enables when code is pasted');
    else r.fail('Load Component button enables when code is pasted', 'still disabled');

    // Cancel closes modal
    await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cancel = btns.find(b => b.textContent.includes('Cancel'));
      if (cancel) cancel.click();
    });
    await b.afterReact(300);

    const pasteModalClosed = await b.eval(() =>
      !document.body.innerText.includes('PASTE REACT COMPONENT') &&
      !document.querySelector('textarea[placeholder*="Paste"]')
    );
    if (pasteModalClosed) r.pass('Cancel closes paste modal');
    else r.fail('Cancel closes paste modal', 'modal still visible');

    const shot1 = await b.screenshot('codepane-paste-modal');
    r.screenshot(shot1);

    // ── Version History panel ─────────────────────────────────────────────────
    r.section('Version history panel');

    const historyBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('History'))
    );
    if (historyBtn) r.pass('History button present in toolbar');
    else r.fail('History button present in toolbar', 'not found');

    await b.eval(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('History'));
      if (btn) btn.click();
    });
    await b.afterReact(400);

    const historyPanelOpen = await b.eval(() =>
      document.body.innerText.includes('VERSION HISTORY') ||
      document.body.innerText.includes('Version History')
    );
    if (historyPanelOpen) r.pass('Version history panel opens');
    else r.fail('Version history panel opens', 'panel content not found');

    const shot2 = await b.screenshot('codepane-history-panel');
    r.screenshot(shot2);

    // Close button (✕) closes panel
    await b.eval(() => {
      // Find ✕ button inside the history panel (right side panel)
      const panel = Array.from(document.querySelectorAll('div')).find(d =>
        d.innerText?.includes('VERSION HISTORY')
      );
      if (panel) {
        const closeBtn = Array.from(panel.querySelectorAll('button')).find(b =>
          b.textContent.includes('✕') || b.textContent.includes('×')
        );
        if (closeBtn) closeBtn.click();
      }
    });
    await b.afterReact(400);

    const historyPanelClosed = await b.eval(() =>
      !document.body.innerText.includes('VERSION HISTORY')
    );
    if (historyPanelClosed) r.pass('✕ closes version history panel');
    else r.fail('✕ closes version history panel', 'panel still visible');

    // ── Inject into file modal ────────────────────────────────────────────────
    r.section('Inject into file modal');

    // Inject is in the Export menu — open it
    const exportMenuBtn = await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      // ExportMenu trigger typically has ↓ or export icon
      return !!btns.find(b =>
        b.title?.toLowerCase().includes('export') ||
        b.textContent.includes('⬇') || b.textContent.includes('↓ Export') ||
        b.textContent.includes('Export')
      );
    });
    if (exportMenuBtn) r.pass('Export menu button present');
    else r.fail('Export menu button present', 'not found');

    await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exp = btns.find(b =>
        b.title?.toLowerCase().includes('export') ||
        b.textContent.includes('Export') || b.textContent.includes('⬇')
      );
      if (exp) exp.click();
    });
    await b.afterReact(300);

    const injectOption = await b.eval(() =>
      document.body.innerText.includes('Inject into file') ||
      document.body.innerText.includes('Inject')
    );
    if (injectOption) r.pass('Inject into file option in export menu');
    else r.fail('Inject into file option in export menu', 'not found');

    // Click Inject into file
    await b.eval(() => {
      const els = Array.from(document.querySelectorAll('button, li, div[role="menuitem"]'));
      const inject = els.find(e => e.textContent.includes('Inject into file'));
      if (inject) inject.click();
    });
    await b.afterReact(400);

    const injectModalOpen = await b.eval(() =>
      document.body.innerText.includes('Inject into file') &&
      !!document.querySelector('input[placeholder*="/path"]')
    );
    if (injectModalOpen) r.pass('Inject into file modal opens with path input');
    else r.fail('Inject into file modal opens with path input', 'modal or input not found');

    const injectBtn = await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const inj = btns.find(b => b.textContent.trim() === 'Inject');
      return inj ? inj.disabled : null;
    });
    if (injectBtn) r.pass('Inject button disabled when path is empty');
    else r.fail('Inject button disabled when path is empty', `disabled=${injectBtn}`);

    // Cancel
    await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cancel = btns.find(b => b.textContent.includes('Cancel'));
      if (cancel) cancel.click();
    });
    await b.afterReact(300);

    const injectClosed = await b.eval(() =>
      !document.querySelector('input[placeholder*="/path"]')
    );
    if (injectClosed) r.pass('Cancel closes inject modal');
    else r.fail('Cancel closes inject modal', 'modal still visible');

    const shot3 = await b.screenshot('codepane-inject-modal');
    r.screenshot(shot3);

    // ── Console errors ────────────────────────────────────────────────────────
    r.section('Console errors');

    const jsErrors = b.flushLogs().filter(l =>
      (l.type === 'pageerror' || l.type === 'error') &&
      !l.text.includes('Failed to load resource') &&
      !l.text.includes('Failed to fetch') &&
      !l.text.includes('api/')
    );
    if (jsErrors.length === 0) r.pass('No unexpected JS errors');
    else r.fail('No unexpected JS errors', jsErrors.map(e => e.text).join('\n    '));

  } catch (err) {
    r.fail('Test runner crashed', err.message);
    console.error(err);
  } finally {
    await b.close();
  }

  const ok = r.summary();
  process.exit(ok ? 0 : 1);
}

run();
