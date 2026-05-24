/**
 * Share URL tests.
 * Verifies creating a share persists to disk, loading ?share= populates
 * the editor, the param is removed from the URL after load, and a bad
 * share ID shows an error banner.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');
const http = require('http');

const SERVER = process.env.SERVER_URL || 'http://localhost:3001';

function postShare(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(`${SERVER}/api/share`);
    const req = http.request({
      hostname: url.hostname, port: url.port || 3001,
      path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { reject(new Error(`Bad JSON: ${d}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getShare(id) {
  return new Promise((resolve, reject) => {
    http.get(`${SERVER}/api/share/${id}`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { reject(new Error(`Bad JSON: ${d}`)); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  // ── API: create and retrieve ───────────────────────────────────────────────
  r.section('Share API');

  const testCode = 'export function ShareTest() { return <h1>Share works!</h1>; }';

  let shareId;
  try {
    const { status, body } = await postShare({
      code: testCode, language: 'tsx', componentName: 'ShareTest', styleSystem: 'tailwind',
    });
    if (status === 200 && body.id) {
      shareId = body.id;
      r.pass('POST /api/share returns id', `id=${body.id}`);
    } else {
      r.fail('POST /api/share returns id', `status=${status} body=${JSON.stringify(body)}`);
    }
  } catch (err) {
    r.fail('POST /api/share returns id', err.message);
  }

  if (shareId) {
    try {
      const { status, body } = await getShare(shareId);
      if (status === 200 && body.code === testCode) {
        r.pass('GET /api/share/:id returns correct code');
      } else {
        r.fail('GET /api/share/:id returns correct code', `status=${status}`);
      }
    } catch (err) {
      r.fail('GET /api/share/:id returns correct code', err.message);
    }

    // ── Browser: ?share= loads code into editor ──────────────────────────────
    r.section('Share URL load');

    try {
      await b.launch({ headless: true });
      await b.goto(`/?share=${shareId}`);
      await b.afterReact(2000);

      const editorCode = await b.eval(() => {
        const lines = document.querySelectorAll('.view-line, .cm-line');
        return Array.from(lines).map(l => l.textContent).join('');
      });
      if (editorCode.includes('ShareTest') || editorCode.includes('Share works')) {
        r.pass('Shared code loaded into editor', `found "ShareTest"`);
      } else {
        r.fail('Shared code loaded into editor', `editor content: "${editorCode.slice(0, 80)}"`);
      }

      const urlClean = await b.eval(() => window.location.search);
      if (!urlClean.includes('share=')) {
        r.pass('?share= param removed from URL after load');
      } else {
        r.fail('?share= param removed from URL after load', `search still: ${urlClean}`);
      }

      const shot = await b.screenshot('share-loaded');
      r.screenshot(shot);

      // ── Error banner for bad id ──────────────────────────────────────────────
      r.section('Share error handling');

      await b.goto('/?share=badbadbadbad');
      await b.afterReact(2000);

      const banner = await b.exists('text=Could not load share');
      if (banner) r.pass('Error banner shown for invalid share id');
      else r.fail('Error banner shown for invalid share id', 'banner text not found');

      const shot2 = await b.screenshot('share-error');
      r.screenshot(shot2);

      // ── Console errors ───────────────────────────────────────────────────────
      r.section('Console errors');

      const jsErrors = b.flushLogs().filter(l =>
        (l.type === 'pageerror' || l.type === 'error') &&
        !l.text.includes('Failed to fetch') &&
        !l.text.includes('Failed to load resource') &&
        !l.text.includes('api/status') &&
        !l.text.includes('api/audit') &&
        !l.text.includes('fetchAgents') &&
        !l.text.includes('share') &&
        !l.text.includes('Share')
      );
      if (jsErrors.length === 0) r.pass('No unexpected JS errors');
      else r.fail('No unexpected JS errors', jsErrors.map(e => e.text).join('\n    '));

    } catch (err) {
      r.fail('Browser test crashed', err.message);
      console.error(err);
    } finally {
      await b.close();
    }
  } else {
    r.info('Skipping browser tests — share creation failed');
  }

  const ok = r.summary();
  process.exit(ok ? 0 : 1);
}

run();
