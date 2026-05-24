/**
 * Editor UI interaction tests.
 * Verifies header tabs, sidebar templates, code editor, and preview pane controls.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  try {
    await b.launch({ headless: true });
    await b.goto('/');
    await b.afterReact(800);

    // ── App shell ────────────────────────────────────────────────────────────
    r.section('App shell');

    const chatTab = await b.exists('text=Chat');
    if (chatTab) r.pass('Chat tab rendered');
    else r.fail('Chat tab rendered', 'Chat tab text not found');

    const shot0 = await b.screenshot('00-default');
    r.screenshot(shot0);

    // ── Sidebar: template library ─────────────────────────────────────────────
    r.section('Sidebar template library');

    // Open sidebar via hamburger
    const hamburger = await b.exists('button');
    if (hamburger) {
      await b.eval(() => {
        // Click the first button in the header (hamburger)
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          const rect = btn.getBoundingClientRect();
          if (rect.top < 50) { btn.click(); return; }
        }
      });
      await b.afterReact(500);
    }

    const templateSection = await b.exists('text=TEMPLATES');
    if (templateSection) r.pass('Sidebar opens with template library');
    else r.fail('Sidebar opens with template library', 'TEMPLATES heading not found');

    const analyticsTpl = await b.exists('text=Analytics Dashboard');
    if (analyticsTpl) r.pass('Analytics Dashboard template listed');
    else r.fail('Analytics Dashboard template listed', 'text not found');

    const adminTpl = await b.exists('text=Admin Dashboard');
    if (adminTpl) r.pass('Admin Dashboard template listed');
    else r.fail('Admin Dashboard template listed', 'text not found');

    // ── Template loading ──────────────────────────────────────────────────────
    r.section('Template loading');

    // Click Analytics Dashboard
    await b.eval(() => {
      const els = Array.from(document.querySelectorAll('p, span, div'));
      const el = els.find(e => e.textContent.trim() === 'Analytics Dashboard');
      if (el) el.click();
    });
    await b.afterReact(2500);

    const editorHasCode = await b.eval(() => {
      const lines = document.querySelectorAll('.view-line, .cm-line');
      return lines.length > 0;
    });
    if (editorHasCode) r.pass('Analytics Dashboard code loaded into editor');
    else r.fail('Analytics Dashboard code loaded into editor', 'no editor lines found');

    const shot1 = await b.screenshot('analytics-dashboard');
    r.screenshot(shot1);

    // Click Admin Dashboard
    await b.eval(() => {
      const els = Array.from(document.querySelectorAll('p, span, div'));
      const el = els.find(e => e.textContent.trim() === 'Admin Dashboard');
      if (el) el.click();
    });
    await b.afterReact(2500);

    const shot2 = await b.screenshot('admin-dashboard');
    r.screenshot(shot2);

    const previewIframe = await b.exists('iframe[title="Component Preview"]');
    if (previewIframe) r.pass('Preview iframe present after template load');
    else r.fail('Preview iframe present after template load', 'iframe not found');

    // ── Preview pane controls ─────────────────────────────────────────────────
    r.section('Preview pane controls');

    const livePreviewLabel = await b.exists('text=LIVE PREVIEW');
    if (livePreviewLabel) r.pass('LIVE PREVIEW label present');
    else r.fail('LIVE PREVIEW label present', 'not found');

    // Zoom buttons (75, 100, 125, 150)
    const zoom75 = await b.exists('button[title="75% zoom"]');
    if (zoom75) r.pass('Zoom controls present');
    else r.fail('Zoom controls present', 'no zoom buttons found');

    // Themes toggle
    const themesBtn = await b.exists('button[title*="theme" i], button[title*="Theme" i]');
    if (themesBtn) r.pass('Themes toggle button present');
    else r.fail('Themes toggle button present', 'not found');

    // Inspect button
    const inspectBtn = await b.exists('button[title*="inspect" i], button[title*="Inspect" i]');
    if (inspectBtn) r.pass('Inspect button present');
    else r.fail('Inspect button present', 'not found');

    // ── Prompt input ──────────────────────────────────────────────────────────
    r.section('Prompt input');

    // Close sidebar first so prompt input is accessible
    await b.eval(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        const rect = btn.getBoundingClientRect();
        if (rect.top < 50) { btn.click(); return; }
      }
    });
    await b.afterReact(400);

    // Click Chat tab if present
    await b.eval(() => {
      const tabs = Array.from(document.querySelectorAll('[class*="tab"]'));
      const chatTab = tabs.find(t => t.textContent.includes('Chat'));
      if (chatTab) chatTab.click();
    });
    await b.afterReact(400);

    const promptInput = await b.exists('textarea, input[type="text"][placeholder]');
    if (promptInput) {
      r.pass('Prompt input present');
      const sel = (await b.exists('textarea')) ? 'textarea' : 'input[type="text"]';
      await b.type(sel, 'hello from browser automation');
      const val = await b.eval(() => {
        const el = document.querySelector('textarea') || document.querySelector('input[type="text"]');
        return el ? el.value : null;
      });
      if (val && val.includes('hello')) r.pass('Typing into prompt input works', `value="${val.slice(0, 40)}"`);
      else r.fail('Typing into prompt input works', `value="${val}"`);
      const shot3 = await b.screenshot('prompt-typed');
      r.screenshot(shot3);
    } else {
      r.fail('Prompt input present', 'no textarea or text input found');
    }

    // ── Console errors ────────────────────────────────────────────────────────
    r.section('Console errors');

    const jsErrors = b.flushLogs().filter(l =>
      (l.type === 'pageerror' || l.type === 'error') &&
      !l.text.includes('Failed to fetch') &&
      !l.text.includes('Failed to load resource') &&
      !l.text.includes('api/status') &&
      !l.text.includes('api/audit') &&
      !l.text.includes('fetchAgents') &&
      !l.text.includes('loadHistory')
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
