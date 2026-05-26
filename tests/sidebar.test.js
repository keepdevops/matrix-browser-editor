/**
 * Sidebar panel tests.
 * Verifies all sidebar tabs render their panels: Templates, Style, Tokens,
 * Animation, Snapshots, Library, Model.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function openSidebar(b) {
  // Check if sidebar drawer is actually visible (not just in DOM)
  const isOpen = await b.eval(() => {
    const btn = document.querySelector('button[title="Templates"]');
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return rect.left >= 0 && rect.left < window.innerWidth;
  });
  if (!isOpen) {
    await b.eval(() => {
      const btn = document.querySelector('button[title="Tools & Settings"]');
      if (btn) btn.click();
    });
    await b.afterReact(600);
  }
}

async function clickSidebarTab(b, title) {
  await b.page.evaluate((t) => {
    const btn = document.querySelector(`button[title="${t}"]`);
    if (btn) btn.click();
  }, title);
  await b.afterReact(500);
}

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  try {
    await b.launch({ headless: true });
    await b.goto('/');
    await b.afterReact(800);
    await openSidebar(b);

    // ── Tab bar ───────────────────────────────────────────────────────────────
    r.section('Sidebar tab bar');

    for (const label of ['Templates', 'Style', 'Tokens', 'Animation', 'Snapshots', 'Library', 'Model']) {
      const tabExists = await b.page.evaluate((lbl) => {
        return !!document.querySelector(`button[title="${lbl}"]`);
      }, label);
      if (tabExists) r.pass(`${label} tab present`);
      else r.fail(`${label} tab present`, `no button for "${label}" found`);
    }

    // ── Templates panel ───────────────────────────────────────────────────────
    r.section('Templates panel');

    await clickSidebarTab(b, 'Templates');
    const templatesHeading = await b.eval(() =>
      document.body.innerText.includes('TEMPLATES') || document.body.innerText.includes('Templates')
    );
    if (templatesHeading) r.pass('Templates panel renders heading');
    else r.fail('Templates panel renders heading', 'TEMPLATES text not found');

    const templateItems = await b.eval(() =>
      document.querySelectorAll('[class*="template"], [data-template]').length ||
      Array.from(document.querySelectorAll('div')).filter(d =>
        d.textContent.includes('Dashboard') || d.textContent.includes('Login')
      ).length > 0
    );
    if (templateItems) r.pass('Template items listed');
    else r.fail('Template items listed', 'no templates found');

    const shot1 = await b.screenshot('sidebar-templates');
    r.screenshot(shot1);

    // ── Style panel ───────────────────────────────────────────────────────────
    r.section('Style panel');

    await clickSidebarTab(b, 'Style');
    const styleContent = await b.eval(() =>
      document.body.innerText.includes('STYLE SYSTEM') || document.body.innerText.includes('Tailwind')
    );
    if (styleContent) r.pass('Style panel renders content');
    else r.fail('Style panel renders content', 'no style content found');

    const shot2 = await b.screenshot('sidebar-style');
    r.screenshot(shot2);

    // ── Tokens panel ──────────────────────────────────────────────────────────
    r.section('Tokens panel');

    await clickSidebarTab(b, 'Tokens');
    const tokensHeading = await b.eval(() => {
      const t = document.body.innerText.toUpperCase();
      return t.includes('DESIGN TOKENS') || t.includes('TOKENS') || t.includes('AI PALETTE');
    });
    if (tokensHeading) r.pass('Tokens panel renders heading');
    else r.fail('Tokens panel renders heading', 'not found');

    const colorSwatch = await b.eval(() => {
      const t = document.body.innerText.toUpperCase();
      return t.includes('COLORS') || t.includes('COLOR') || !!document.querySelector('input[type="color"]');
    });
    if (colorSwatch) r.pass('Color tokens section present');
    else r.fail('Color tokens section present', 'no colors found');

    const typographySection = await b.eval(() => {
      const t = document.body.innerText.toUpperCase();
      return t.includes('TYPOGRAPHY') || t.includes('FONT');
    });
    if (typographySection) r.pass('Typography tokens section present');
    else r.fail('Typography tokens section present', 'not found');

    const resetBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reset'))
    );
    if (resetBtn) r.pass('Reset button present in Tokens panel');
    else r.fail('Reset button present in Tokens panel', 'not found');

    const shot3 = await b.screenshot('sidebar-tokens');
    r.screenshot(shot3);

    // ── Animation panel ───────────────────────────────────────────────────────
    r.section('Animation panel');

    await clickSidebarTab(b, 'Animation');
    const animHeading = await b.eval(() =>
      document.body.innerText.includes('Animation Editor') || document.body.innerText.includes('ANIMATION')
    );
    if (animHeading) r.pass('Animation panel renders heading');
    else r.fail('Animation panel renders heading', 'not found');

    const durationSection = await b.eval(() =>
      document.body.innerText.includes('Duration') || document.body.innerText.includes('Easing') ||
      document.body.innerText.includes('DURATION') || document.body.innerText.includes('EASING')
    );
    if (durationSection) r.pass('Duration/Easing controls present');
    else r.fail('Duration/Easing controls present', 'not found');

    const applyAllBtn = await b.eval(() =>
      !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('All'))
    );
    if (applyAllBtn) r.pass('Apply All button present');
    else r.fail('Apply All button present', 'not found');

    const shot4 = await b.screenshot('sidebar-animation');
    r.screenshot(shot4);

    // ── Snapshots panel ───────────────────────────────────────────────────────
    r.section('Snapshots panel');

    await clickSidebarTab(b, 'Snapshots');
    const snapshotsContent = await b.eval(() =>
      document.body.innerText.includes('snapshot') || document.body.innerText.includes('Snapshot') ||
      document.body.innerText.includes('SNAPSHOTS')
    );
    if (snapshotsContent) r.pass('Snapshots panel renders');
    else r.fail('Snapshots panel renders', 'not found');

    const shot5 = await b.screenshot('sidebar-snapshots');
    r.screenshot(shot5);

    // ── Library panel ─────────────────────────────────────────────────────────
    r.section('Library panel');

    await clickSidebarTab(b, 'Library');
    const libraryContent = await b.eval(() =>
      document.body.innerText.includes('Library') || document.body.innerText.includes('library') ||
      document.body.innerText.includes('saved') || document.body.innerText.includes('component')
    );
    if (libraryContent) r.pass('Library panel renders');
    else r.fail('Library panel renders', 'not found');

    const shot6 = await b.screenshot('sidebar-library');
    r.screenshot(shot6);

    // ── Model panel ───────────────────────────────────────────────────────────
    r.section('Model panel');

    await clickSidebarTab(b, 'Model');
    const modelContent = await b.eval(() =>
      document.body.innerText.includes('AI Backend') || document.body.innerText.includes('llama.cpp') ||
      document.body.innerText.includes('AI BACKEND')
    );
    if (modelContent) r.pass('Model panel renders backend options');
    else r.fail('Model panel renders backend options', 'not found');

    const serverStatus = await b.eval(() =>
      document.body.innerText.includes('Server Status') || document.body.innerText.includes('SERVER STATUS')
    );
    if (serverStatus) r.pass('Server Status section present');
    else r.fail('Server Status section present', 'not found');

    const shot7 = await b.screenshot('sidebar-model');
    r.screenshot(shot7);

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
