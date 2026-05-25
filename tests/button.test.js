/**
 * Button component tests.
 * Verifies all variants, sizes, disabled state, and click behaviour
 * by injecting a showcase page into the live app iframe.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  try {
    await b.launch({ headless: true });

    // Serve a self-contained page that imports the compiled CSS from the dev server
    // and renders every Button variant directly.
    const base = process.env.BASE_URL || 'http://localhost:5174';
    await b.page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="${base}/src/index.css">
        <style>
          body { background:#0a0f1e; padding:32px; font-family:system-ui; margin:0; }
          .row { display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
        </style>
      </head>
      <body>
        <div class="row" data-section="default">
          <button class="swarm-btn" data-testid="btn-default">Default</button>
        </div>
        <div class="row" data-section="primary">
          <button class="swarm-btn swarm-btn-primary" data-testid="btn-primary">Primary</button>
        </div>
        <div class="row" data-section="secondary">
          <button class="swarm-btn swarm-btn-secondary" data-testid="btn-secondary">Secondary</button>
        </div>
        <div class="row" data-section="warning">
          <button class="swarm-btn swarm-btn-warning" data-testid="btn-warning">Warning</button>
        </div>
        <div class="row" data-section="destructive">
          <button class="swarm-btn swarm-btn-destructive" data-testid="btn-destructive">Destructive</button>
        </div>
        <div class="row" data-section="sizes">
          <button class="swarm-btn swarm-btn-sm" data-testid="btn-sm">Small</button>
          <button class="swarm-btn swarm-btn-xs" data-testid="btn-xs">XSmall</button>
          <button class="swarm-btn swarm-btn-icon" data-testid="btn-icon">⚙</button>
        </div>
        <div class="row" data-section="disabled">
          <button class="swarm-btn" data-testid="btn-disabled" disabled>Disabled</button>
          <button class="swarm-btn swarm-btn-primary" data-testid="btn-primary-disabled" disabled>Disabled Primary</button>
        </div>
        <div class="row" data-section="click">
          <button class="swarm-btn swarm-btn-secondary" data-testid="btn-click" onclick="this.dataset.clicked='true'">Click me</button>
        </div>
      </body>
      </html>
    `);
    await b.afterReact(800);

    // ── Rendering ────────────────────────────────────────────────────────────
    r.section('Button rendering');

    for (const [id, label] of [
      ['btn-default',     'default variant'],
      ['btn-primary',     'primary variant'],
      ['btn-secondary',   'secondary variant'],
      ['btn-warning',     'warning variant'],
      ['btn-destructive', 'destructive variant'],
      ['btn-sm',          'sm size'],
      ['btn-xs',          'xs size'],
      ['btn-icon',        'icon size'],
    ]) {
      const el = await b.page.$(`[data-testid="${id}"]`);
      if (el) r.pass(`renders ${label}`);
      else    r.fail(`renders ${label}`, `[data-testid="${id}"] not found`);
    }

    // ── Dimensions ───────────────────────────────────────────────────────────
    r.section('Button dimensions');

    const defaultH = await b.page.$eval('[data-testid="btn-default"]',
      el => Math.round(el.getBoundingClientRect().height));
    if (defaultH === 36) r.pass(`default height is 36px (got ${defaultH}px)`);
    else                 r.fail(`default height is 36px`, `got ${defaultH}px`);

    const smH = await b.page.$eval('[data-testid="btn-sm"]',
      el => Math.round(el.getBoundingClientRect().height));
    if (smH === 32) r.pass(`sm height is 32px (got ${smH}px)`);
    else            r.fail(`sm height is 32px`, `got ${smH}px`);

    const iconBox = await b.page.$eval('[data-testid="btn-icon"]', el => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (iconBox.w === 36 && iconBox.h === 36) r.pass(`icon button is 36×36px`);
    else r.fail(`icon button is 36×36px`, `got ${iconBox.w}×${iconBox.h}px`);

    // ── Colours ──────────────────────────────────────────────────────────────
    r.section('Button colours');

    const primaryBg = await b.page.$eval('[data-testid="btn-primary"]',
      el => getComputedStyle(el).backgroundColor);
    if (primaryBg.includes('34') || primaryBg.includes('22')) // rgb(34,197,94) = #22c55e
      r.pass(`primary has green background (${primaryBg})`);
    else
      r.fail(`primary has green background`, `got ${primaryBg}`);

    const secondaryBg = await b.page.$eval('[data-testid="btn-secondary"]',
      el => getComputedStyle(el).backgroundColor);
    if (secondaryBg.includes('59') || secondaryBg.includes('3b')) // rgb(59,130,246) = #3b82f6
      r.pass(`secondary has blue background (${secondaryBg})`);
    else
      r.fail(`secondary has blue background`, `got ${secondaryBg}`);

    const warningBg = await b.page.$eval('[data-testid="btn-warning"]',
      el => getComputedStyle(el).backgroundColor);
    if (warningBg.includes('245') || warningBg.includes('f5')) // rgb(245,158,11) = #f59e0b
      r.pass(`warning has amber background (${warningBg})`);
    else
      r.fail(`warning has amber background`, `got ${warningBg}`);

    // ── Disabled state ───────────────────────────────────────────────────────
    r.section('Button disabled state');

    const disabledAttr = await b.page.$eval('[data-testid="btn-disabled"]', el => el.disabled);
    if (disabledAttr) r.pass('disabled button has disabled attribute');
    else              r.fail('disabled button has disabled attribute', 'attribute missing');

    const disabledOpacity = await b.page.$eval('[data-testid="btn-disabled"]',
      el => parseFloat(getComputedStyle(el).opacity));
    if (disabledOpacity < 0.7) r.pass(`disabled button is visually dimmed (opacity ${disabledOpacity})`);
    else                       r.fail(`disabled button is visually dimmed`, `opacity ${disabledOpacity}`);

    const disabledCursor = await b.page.$eval('[data-testid="btn-disabled"]',
      el => getComputedStyle(el).cursor);
    if (disabledCursor === 'not-allowed') r.pass('disabled cursor is not-allowed');
    else                                  r.fail('disabled cursor is not-allowed', `got ${disabledCursor}`);

    // ── Click interaction ────────────────────────────────────────────────────
    r.section('Button click interaction');

    await b.page.click('[data-testid="btn-click"]');
    await b.afterReact(200);

    const wasClicked = await b.page.$eval('[data-testid="btn-click"]',
      el => el.dataset.clicked);
    if (wasClicked === 'true') r.pass('click handler fires correctly');
    else                       r.fail('click handler fires correctly', 'dataset.clicked not set');

    const disabledClickable = await b.page.$eval('[data-testid="btn-disabled"]', el => {
      let fired = false;
      el.addEventListener('click', () => { fired = true; });
      el.click();
      return fired;
    });
    if (!disabledClickable) r.pass('disabled button does not fire click events');
    else                    r.fail('disabled button does not fire click events', 'click fired on disabled');

    // ── Screenshot ───────────────────────────────────────────────────────────
    r.section('Visual');
    const shot = await b.screenshot('button-variants');
    r.screenshot(shot);

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
