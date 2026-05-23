/**
 * Editor layout and preview tests.
 * Verifies the split editor/preview layout, viewport controls, and template rendering.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

const TEMPLATES = [
  { name: 'Analytics Dashboard', expectText: 'Analytics' },
  { name: 'Admin Dashboard',     expectText: 'Admin' },
  { name: 'Login Form',          expectText: null },
  { name: 'Data Table',          expectText: null },
];

const VIEWPORT_BTNS = [
  { title: 'Mobile (375px)',  label: '📱' },
  { title: 'Tablet (768px)',  label: '⊞' },
  { title: 'Desktop (full)',  label: '⊡' },
];

async function openSidebar(b) {
  await b.eval(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      const rect = btn.getBoundingClientRect();
      if (rect.top < 50) { btn.click(); return; }
    }
  });
  await b.afterReact(500);
}

async function clickTemplate(b, name) {
  await b.eval((n) => {
    const els = Array.from(document.querySelectorAll('p, span, div'));
    const el = els.find(e => e.textContent.trim() === n);
    if (el) el.click();
  }, name);
  await b.afterReact(2500);
}

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  try {
    await b.launch({ headless: true });
    await b.goto('/');
    await b.afterReact(800);

    // ── App loads ─────────────────────────────────────────────────────────────
    r.section('App loads');

    const editorPane = await b.exists('.monaco-editor, [class*="editor"], [class*="code"]');
    if (editorPane) r.pass('Code editor pane rendered');
    else r.fail('Code editor pane rendered', 'no editor element found');

    const previewPane = await b.exists('text=LIVE PREVIEW');
    if (previewPane) r.pass('Preview pane rendered with LIVE PREVIEW label');
    else r.fail('Preview pane rendered with LIVE PREVIEW label', 'not found');

    const previewIframe = await b.exists('iframe[title="Component Preview"]');
    if (previewIframe) r.pass('Preview iframe present');
    else r.fail('Preview iframe present', 'not found');

    const shot0 = await b.screenshot('00-default');
    r.screenshot(shot0);

    // ── Viewport controls ─────────────────────────────────────────────────────
    r.section('Viewport controls');

    for (const vp of VIEWPORT_BTNS) {
      const btn = await b.exists(`button[title="${vp.title}"]`);
      if (btn) r.pass(`Viewport button: ${vp.title}`);
      else r.fail(`Viewport button: ${vp.title}`, `button[title="${vp.title}"] not found`);
    }

    // Click mobile viewport and verify iframe width changes
    await b.eval(() => {
      const btn = document.querySelector('button[title="Mobile (375px)"]');
      if (btn) btn.click();
    });
    await b.afterReact(400);

    const mobileIframeWidth = await b.eval(() => {
      const iframe = document.querySelector('iframe[title="Component Preview"]');
      return iframe ? Math.round(parseFloat(getComputedStyle(iframe).width)) : null;
    });
    if (mobileIframeWidth && mobileIframeWidth <= 400) {
      r.pass('Mobile viewport sets iframe to 375px', `width=${mobileIframeWidth}px`);
    } else {
      r.fail('Mobile viewport sets iframe to 375px', `width=${mobileIframeWidth}px`);
    }

    // Reset to desktop
    await b.eval(() => {
      const btn = document.querySelector('button[title="Desktop (full)"]');
      if (btn) btn.click();
    });
    await b.afterReact(300);

    const shot1 = await b.screenshot('layout-default');
    r.screenshot(shot1);

    // ── Template rendering ────────────────────────────────────────────────────
    r.section('Template rendering');

    await openSidebar(b);

    for (const tpl of TEMPLATES) {
      await clickTemplate(b, tpl.name);

      const errors = b.flushLogs().filter(l =>
        (l.type === 'pageerror' || l.type === 'error') &&
        !l.text.includes('Failed to fetch') &&
        !l.text.includes('api/status') &&
        !l.text.includes('fetchAgents') &&
        !l.text.includes('style property during rerender')
      );
      const noErr = errors.length === 0;

      const iframeVisible = await b.exists('iframe[title="Component Preview"]');

      if (iframeVisible && noErr) {
        r.pass(`template: ${tpl.name}`, 'loaded without errors');
      } else {
        const detail = [
          !iframeVisible && 'preview iframe not visible',
          !noErr && `JS errors: ${errors.map(e => e.text).join('; ')}`,
        ].filter(Boolean).join(' | ');
        r.fail(`template: ${tpl.name}`, detail);
      }

      const shotName = `layout-${tpl.name.toLowerCase().replace(/\s+/g, '-')}`;
      const shot = await b.screenshot(shotName);
      r.screenshot(shot);
    }

    // ── Preview min-width: full dashboard renders ─────────────────────────────
    r.section('Dashboard preview width');

    await clickTemplate(b, 'Admin Dashboard');

    const iframeWidth = await b.eval(() => {
      const iframe = document.querySelector('iframe[title="Component Preview"]');
      return iframe ? Math.round(parseFloat(getComputedStyle(iframe).width)) : null;
    });
    if (iframeWidth && iframeWidth >= 600) {
      r.pass('Preview iframe at least 600px wide for dashboard', `width=${iframeWidth}px`);
    } else {
      r.fail('Preview iframe at least 600px wide for dashboard', `width=${iframeWidth}px`);
    }

    const shot2 = await b.screenshot('layout-dashboard');
    r.screenshot(shot2);

    // ── Preview stays visible during invalid code ─────────────────────────────
    r.section('Preview stability');

    // Click into the editor content area and press a key to introduce a syntax error
    const editorContent = await b.exists('.monaco-editor .view-lines');
    if (editorContent) {
      await b.eval(() => {
        // Focus the editor by clicking its content area
        const lines = document.querySelector('.monaco-editor .view-lines');
        if (lines) lines.click();
      });
      await b.afterReact(300);
      // Use keyboard to go to line start and type an invalid char
      await b.page.keyboard.press('Home');
      await b.page.keyboard.type('<');
      await b.afterReact(600); // within debounce window

      const iframeStillPresent = await b.exists('iframe[title="Component Preview"]');
      if (iframeStillPresent) r.pass('Preview iframe stays present during invalid code');
      else r.fail('Preview iframe stays present during invalid code', 'iframe disappeared');
    } else {
      r.info('Monaco editor content area not found — skipping stability test');
    }

    const shot3 = await b.screenshot('layout-sidebar');
    r.screenshot(shot3);

    // ── Console errors ────────────────────────────────────────────────────────
    r.section('Console errors');

    const jsErrors = b.flushLogs().filter(l =>
      (l.type === 'pageerror' || l.type === 'error') &&
      !l.text.includes('Failed to fetch') &&
      !l.text.includes('api/status') &&
      !l.text.includes('fetchAgents') &&
      !l.text.includes('loadHistory')
    );
    if (jsErrors.length === 0) r.pass('No unexpected JS errors across all tests');
    else r.fail('No unexpected JS errors across all tests', jsErrors.map(e => e.text).join('\n    '));

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
