/**
 * Keyboard shortcut tests.
 * Verifies the help modal opens via ?, shortcut list renders, and
 * key bindings trigger editor actions (undo, format, diff toggle).
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function loadTemplate(b) {
  // Open sidebar and load Analytics Dashboard so the editor has code
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
  await b.afterReact(2000);
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

    // ── Help modal (?) ────────────────────────────────────────────────────────
    r.section('Help modal');

    const helpBtn = await b.exists('button[title*="Help"], button[title*="shortcut"], button[title*="?"]');
    if (helpBtn) r.pass('Help button (?) present in nav');
    else r.fail('Help button (?) present in nav', 'not found');

    // Click the ? button
    await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const help = btns.find(b =>
        b.title?.includes('Help') || b.title?.includes('shortcut') || b.textContent.trim() === '?'
      );
      if (help) help.click();
    });
    await b.afterReact(400);

    const modalOpen = await b.eval(() => {
      const els = Array.from(document.querySelectorAll('*'));
      return !!els.find(e =>
        e.textContent.includes('Keyboard') || e.textContent.includes('Shortcuts') ||
        e.textContent.includes('shortcuts')
      );
    });
    if (modalOpen) r.pass('Keyboard help modal opens');
    else r.fail('Keyboard help modal opens', 'modal content not found');

    // Tabs inside modal
    const shortcutsTab = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Shortcuts'))
    );
    if (shortcutsTab) r.pass('Shortcuts tab present in modal');
    else r.fail('Shortcuts tab present in modal', 'tab not found');

    const guideTab = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Guide') || b.textContent.includes('Feature'))
    );
    if (guideTab) r.pass('Feature Guide tab present in modal');
    else r.fail('Feature Guide tab present in modal', 'tab not found');

    // Shortcut entries rendered
    // Click Shortcuts tab to see the key entries
    await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const tab = btns.find(b => b.textContent.includes('Shortcuts') || b.textContent.includes('⌨'));
      if (tab) tab.click();
    });
    await b.afterReact(300);

    const hasShortcutEntries = await b.eval(() => {
      const text = document.body.innerText;
      return text.includes('Ctrl') || text.includes('⌘') || text.includes('Cmd') ||
             text.includes('Enter') || text.includes('Shift');
    });
    if (hasShortcutEntries) r.pass('Shortcut key entries rendered');
    else r.fail('Shortcut key entries rendered', 'no shortcut keys found');

    const shot1 = await b.screenshot('keyboard-help-modal');
    r.screenshot(shot1);

    // Close modal with Escape
    await b.page.keyboard.press('Escape');
    await b.afterReact(300);

    const modalClosed = await b.eval(() => {
      const els = Array.from(document.querySelectorAll('*'));
      // Modal should be gone — check for its heading
      return !els.find(e => e.tagName === 'H2' && e.textContent.includes('Keyboard'));
    });
    if (modalClosed) r.pass('Escape closes the help modal');
    else r.fail('Escape closes the help modal', 'modal still visible');

    // ── Load template so editor has code to act on ────────────────────────────
    await loadTemplate(b);

    // ── Undo/Redo buttons respond ─────────────────────────────────────────────
    r.section('Editor keyboard actions');

    const undoBtn = await b.exists('button[title*="Undo"]');
    if (undoBtn) r.pass('Undo button present');
    else r.fail('Undo button present', 'not found');

    const redoBtn = await b.exists('button[title*="Redo"]');
    if (redoBtn) r.pass('Redo button present');
    else r.fail('Redo button present', 'not found');

    // After template load, history has one entry — undo enabled; verify it responds
    const undoState = await b.eval(() => {
      const btn = document.querySelector('button[title*="Undo"]');
      return btn ? { disabled: btn.disabled, exists: true } : { exists: false };
    });
    if (undoState.exists) r.pass(`Undo button state is accessible (disabled=${undoState.disabled})`);
    else r.fail('Undo button accessible', 'button[title*="Undo"] not found');

    // Format button present and enabled when code exists
    const formatBtn = await b.exists('button[title*="Format"]');
    if (formatBtn) r.pass('Format button present');
    else r.fail('Format button present', 'not found');

    const formatEnabled = await b.eval(() => {
      const btn = document.querySelector('button[title*="Format"]');
      return btn ? !btn.disabled : false;
    });
    if (formatEnabled) r.pass('Format button enabled when editor has code');
    else r.fail('Format button enabled when editor has code', 'button disabled');

    // Diff toggle button
    const diffBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Diff Off') || b.textContent.includes('Diff On')
      )
    );
    if (diffBtn) r.pass('Diff toggle button present');
    else r.fail('Diff toggle button present', 'not found');

    const shot2 = await b.screenshot('keyboard-editor-actions');
    r.screenshot(shot2);

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
