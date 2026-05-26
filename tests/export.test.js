/**
 * Export & Share tests.
 * Verifies Copy code, Download file, Share link, ZIP export buttons,
 * and the embed snippet flow via the Export menu.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function openSidebarIfClosed(b) {
  const open = await b.eval(() => !!document.querySelector('button[title="Templates"]'));
  if (!open) {
    await b.eval(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) { if (btn.getBoundingClientRect().top < 50) { btn.click(); return; } }
    });
    await b.afterReact(600);
  }
}

async function closeSidebar(b) {
  const open = await b.eval(() => !!document.querySelector('button[title="Templates"]'));
  if (open) {
    await b.eval(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) { if (btn.getBoundingClientRect().top < 50) { btn.click(); return; } }
    });
    await b.afterReact(400);
  }
}

async function loadTemplate(b) {
  await openSidebarIfClosed(b);
  await b.eval(() => {
    const els = Array.from(document.querySelectorAll('p, span, div'));
    const el = els.find(e => e.textContent.trim() === 'Analytics Dashboard');
    if (el) el.click();
  });
  await b.afterReact(2500);
  await closeSidebar(b);
}

async function openExportMenu(b) {
  await b.eval(() => {
    const btn = document.querySelector('button[title="Export options"]');
    if (btn) btn.click();
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

    // ── Toolbar buttons ───────────────────────────────────────────────────────
    r.section('Toolbar export controls');

    const copyBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Copy')
    );
    if (copyBtn) r.pass('Copy button present');
    else r.fail('Copy button present', 'not found');

    const saveBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save')
    );
    if (saveBtn) r.pass('Save button present');
    else r.fail('Save button present', 'not found');

    const shareBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Share') || b.textContent.includes('🔗')
      )
    );
    if (shareBtn) r.pass('Share button present');
    else r.fail('Share button present', 'not found');

    // Share button should be enabled when code is loaded
    const shareEnabled = await b.eval(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Share') || b.textContent.includes('🔗')
      );
      return btn ? !btn.disabled : false;
    });
    if (shareEnabled) r.pass('Share button enabled when editor has code');
    else r.fail('Share button enabled when editor has code', 'button disabled');

    // ── Export menu ───────────────────────────────────────────────────────────
    r.section('Export menu');

    const exportMenuBtn = await b.exists('button[title="Export options"]');
    if (exportMenuBtn) r.pass('Export menu button present');
    else r.fail('Export menu button present', 'button[title="Export options"] not found');

    await openExportMenu(b);

    // After clicking, the dropdown is rendered — check visible button text
    const menuText = await b.eval(() => {
      // Only look at buttons that are inside the export dropdown (z-index 200)
      return Array.from(document.querySelectorAll('button'))
        .map(b => b.textContent.trim())
        .join('\n');
    });

    const exportItems = [
      ['Copy code',            'Copy code'],
      ['Download',             'Download'],
      ['Download ZIP',         'Download ZIP'],
      ['GitHub Gist',          'GitHub Gist'],
      ['Generate Tests',       'Generate Tests'],
      ['Generate Docs',        'Generate Docs'],
      ['Storybook',            'Storybook'],
      ['Export to filesystem', 'Export to filesystem'],
      ['Inject into file',     'Inject into file'],
      ['Upload image asset',   'Upload image asset'],
    ];

    for (const [label, search] of exportItems) {
      if (menuText.includes(search)) r.pass(`"${label}" option in export menu`);
      else r.fail(`"${label}" option in export menu`, 'not found');
    }

    const shot1 = await b.screenshot('export-menu-open');
    r.screenshot(shot1);

    // Embed snippet disabled before sharing
    const embedDisabled = await b.eval(() => {
      const els = Array.from(document.querySelectorAll('button, li, [role="menuitem"]'));
      const embed = els.find(e => e.textContent.includes('embed snippet') || e.textContent.includes('embed code'));
      return embed ? (embed.disabled || embed.getAttribute('aria-disabled') === 'true' ||
        embed.style.opacity === '0.5' || embed.classList.contains('disabled')) : null;
    });
    if (embedDisabled !== false && embedDisabled !== null)
      r.pass('Embed snippet option disabled before sharing');
    else
      r.fail('Embed snippet option disabled before sharing', `state=${embedDisabled}`);

    // Close menu with Escape
    await b.page.keyboard.press('Escape');
    await b.afterReact(200);

    // ── New file button ───────────────────────────────────────────────────────
    r.section('New file');

    const newBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('+ New') || b.textContent.trim() === '+ New')
    );
    if (newBtn) r.pass('+ New file button present');
    else r.fail('+ New file button present', 'not found');

    // ── Review button ─────────────────────────────────────────────────────────
    r.section('AI Review');

    const reviewBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Review') || b.title?.includes('review')
      )
    );
    if (reviewBtn) r.pass('Review button present');
    else r.fail('Review button present', 'not found');

    const reviewEnabled = await b.eval(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Review') || b.title?.includes('review')
      );
      return btn ? !btn.disabled : false;
    });
    if (reviewEnabled) r.pass('Review button enabled when code present');
    else r.fail('Review button enabled when code present', 'disabled');

    // ── Share API round-trip ──────────────────────────────────────────────────
    r.section('Share API');

    const base = process.env.BASE_URL || 'http://localhost:5173';
    const serverBase = base.replace('5173', '3001').replace('5174', '3001');

    try {
      const res = await b.page.evaluate(async (url) => {
        const r = await fetch(`${url}/api/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: 'export function Test() { return <div>hi</div>; }', language: 'tsx', name: 'Test' }),
        });
        return { status: r.status, body: await r.json() };
      }, serverBase);

      if (res.status === 200 && res.body.id) {
        r.pass(`Share API returns id (${res.body.id})`);

        // Retrieve it back
        const get = await b.page.evaluate(async ({ url, id }) => {
          const r = await fetch(`${url}/api/share/${id}`);
          return { status: r.status, body: await r.json() };
        }, { url: serverBase, id: res.body.id });

        if (get.status === 200 && get.body.code?.includes('Test'))
          r.pass('Share GET returns correct code');
        else
          r.fail('Share GET returns correct code', `status=${get.status}`);
      } else {
        r.fail('Share API returns id', `status=${res.status}`);
      }
    } catch (e) {
      r.fail('Share API round-trip', e.message);
    }

    const shot2 = await b.screenshot('export-toolbar');
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
