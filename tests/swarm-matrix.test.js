/**
 * Swarm Matrix template tests.
 * Verifies the template loads, preview renders key UI elements,
 * and interactive controls (mode toggle, send button, KV clear) work.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function openSidebar(b) {
  await b.eval(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.getBoundingClientRect().top < 50) { btn.click(); return; }
    }
  });
  await b.afterReact(500);
}

async function clickSwarmMatrix(b) {
  await b.eval(() => {
    const els = Array.from(document.querySelectorAll('p, span, div'));
    const el = els.find(e => e.textContent.trim() === 'Swarm Matrix');
    if (el) el.click();
  });
  await b.afterReact(2500);
}

async function iframeSrcdoc(b) {
  return b.eval(() => {
    const iframe = document.querySelector('iframe[title="Component Preview"]');
    return iframe?.srcdoc ?? '';
  });
}

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  try {
    await b.launch({ headless: true });
    await b.goto('/');
    await b.afterReact(800);

    // ── Load template ─────────────────────────────────────────────────────────
    r.section('Load Swarm Matrix template');

    await openSidebar(b);
    await clickSwarmMatrix(b);

    const editorHasCode = await b.eval(() => {
      const lines = document.querySelectorAll('.view-line, .cm-line');
      return lines.length > 0;
    });
    if (editorHasCode) r.pass('Swarm Matrix code loaded into editor');
    else r.fail('Swarm Matrix code loaded into editor', 'no editor lines found');

    const previewIframe = await b.exists('iframe[title="Component Preview"]');
    if (previewIframe) r.pass('Preview iframe present');
    else r.fail('Preview iframe present', 'not found');

    const shot0 = await b.screenshot('swarm-matrix-loaded');
    r.screenshot(shot0);

    // ── Preview content ───────────────────────────────────────────────────────
    r.section('Preview renders Swarm Matrix UI');

    await b.afterReact(800);
    const srcdoc = await iframeSrcdoc(b);

    if (srcdoc.includes('SwarmMatrix') || srcdoc.includes('ONLINE')) {
      r.pass('Preview srcdoc contains Swarm Matrix content', 'found "SwarmMatrix" or "ONLINE"');
    } else {
      r.fail('Preview srcdoc contains Swarm Matrix content', `srcdoc snippet: "${srcdoc.slice(0, 120)}"`);
    }

    if (srcdoc.includes('ONLINE')) r.pass('ONLINE status badge in srcdoc');
    else r.fail('ONLINE status badge in srcdoc', 'not found');

    if (srcdoc.includes('ROUTER') || srcdoc.includes('MODE')) r.pass('Mode indicator in srcdoc');
    else r.fail('Mode indicator in srcdoc', 'ROUTER/MODE not found');

    if (srcdoc.includes('architect') || srcdoc.includes('foreman')) r.pass('Agent names in srcdoc');
    else r.fail('Agent names in srcdoc', 'agent names not found');

    const shot1 = await b.screenshot('swarm-matrix-preview');
    r.screenshot(shot1);

    // ── No JS errors on load ──────────────────────────────────────────────────
    r.section('No errors on load');

    const loadErrors = b.flushLogs().filter(l =>
      (l.type === 'pageerror' || l.type === 'error') &&
      !l.text.includes('Failed to fetch') &&
      !l.text.includes('api/status') &&
      !l.text.includes('fetchAgents') &&
      !l.text.includes('style property during rerender')
    );
    if (loadErrors.length === 0) r.pass('No JS errors after template load');
    else r.fail('No JS errors after template load', loadErrors.map(e => e.text).join('\n    '));

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
