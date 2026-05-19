/**
 * Layout switcher integration tests.
 * Verifies that selecting each layout in the header <select> actually
 * swaps the root DOM structure and updates the URL param.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

const LAYOUTS = {
  default:   { rootClass: 'matrix-container' },
  sidebar:   { rootClass: 'sl-root' },
  minimal:   { rootClass: 'ml-root' },
  terminal:  { rootClass: 'tl-root' },
  dashboard: { rootClass: 'dl-root' },
  neo:       { rootClass: 'neo-root' },
  operator:  { rootClass: 'op-root' },
  results:   { rootClass: 'rl-root' },
};

async function run() {
  const r  = new Reporter();
  const b  = new BrowserSession();

  try {
    await b.launch({ headless: true });
    await b.goto('/');

    r.section('App loads');
    const title = await b.text('h1');
    if (title && title.includes('Swarm')) r.pass('Page title contains Swarm', title.trim());
    else r.fail('Page title', `got: ${title}`);

    const layoutSelect = await b.exists('select[aria-label="Layout"]');
    if (layoutSelect) r.pass('Layout <select> present');
    else r.fail('Layout <select> present', 'selector not found');

    const themeSelect = await b.exists('select[aria-label="Theme"]');
    if (themeSelect) r.pass('Theme <select> present');
    else r.fail('Theme <select> present', 'selector not found');

    const shot0 = await b.screenshot('00-default');
    r.screenshot(shot0);

    r.section('Layout switching');
    for (const [id, { rootClass }] of Object.entries(LAYOUTS)) {
      await b.selectByValue('select[aria-label="Layout"]', id);

      const params = await b.urlParams();
      const urlOk  = params.layout === id;

      const domOk  = await b.exists(`.${rootClass}`);
      const errors = b.flushLogs().filter(l =>
        (l.type === 'pageerror' || l.type === 'error') &&
        !l.text.includes('503') && !l.text.includes('Failed to fetch') && !l.text.includes('fetchAgents') && !l.text.includes('loadHistory')
      );
      const noErr  = errors.length === 0;

      if (urlOk && domOk && noErr) {
        r.pass(`layout=${id}`, `.${rootClass} present, URL updated`);
      } else {
        const detail = [
          !urlOk  && `URL param is "${params.layout}"`,
          !domOk  && `.${rootClass} not found in DOM`,
          !noErr  && `JS errors: ${errors.map(e => e.text).join('; ')}`,
        ].filter(Boolean).join(' | ');
        r.fail(`layout=${id}`, detail);
      }

      const shot = await b.screenshot(`layout-${id}`);
      r.screenshot(shot);
    }

    r.section('Theme switching');
    for (const themeId of ['dark', 'light']) {
      await b.selectByValue('select[aria-label="Theme"]', themeId);
      const attr  = await b.eval(() => document.body.getAttribute('data-theme'));
      const params = await b.urlParams();
      const ok = attr === themeId && params.theme === themeId;
      if (ok) r.pass(`theme=${themeId}`, `data-theme="${attr}", URL param ok`);
      else r.fail(`theme=${themeId}`, `data-theme="${attr}", url theme="${params.theme}"`);
    }

    r.section('URL persistence');
    await b.goto('/?layout=neo&theme=dark');
    await b.afterReact(800);
    const neoOk = await b.exists('.neo-root');
    if (neoOk) r.pass('Direct URL ?layout=neo loads Neo layout');
    else r.fail('Direct URL ?layout=neo loads Neo layout', '.neo-root not found');

    await b.goto('/?layout=unknown&theme=unknown');
    await b.afterReact(800);
    // localStorage from previous test may restore last valid layout; just verify no crash + some root exists
    const anyRoot = await b.eval(() =>
      Boolean(document.querySelector('.matrix-container,.sl-root,.ml-root,.tl-root,.dl-root,.neo-root,.op-root,.rl-root'))
    );
    const noPageError = b.flushLogs().filter(l => l.type === 'pageerror').length === 0;
    if (anyRoot && noPageError) r.pass('Unknown layout: graceful fallback (no crash, renders valid root)');
    else r.fail('Unknown layout: graceful fallback', `anyRoot=${anyRoot} noPageError=${noPageError}`);

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
