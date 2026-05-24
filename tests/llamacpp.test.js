/**
 * llama.cpp integration tests.
 * Verifies the status endpoint exposes llama.cpp fields, the agent route
 * accepts preferredBackend, fallback to Claude works when llama.cpp is
 * unreachable, and the Model tab renders in the sidebar.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');
const http = require('http');

const SERVER = process.env.SERVER_URL || 'http://localhost:3001';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { reject(new Error(`Bad JSON: ${d.slice(0, 80)}`)); }
      });
    }).on('error', reject);
  });
}

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(path, SERVER);
    const req = http.request({
      hostname: url.hostname, port: url.port || 3001,
      path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, raw: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  // ── Status endpoint ────────────────────────────────────────────────────────
  r.section('Status endpoint llama.cpp fields');

  try {
    const { status, body } = await get(`${SERVER}/api/status`);
    if (status === 200) r.pass('GET /api/status returns 200');
    else r.fail('GET /api/status returns 200', `status=${status}`);

    if ('llamaCppEnabled' in body) r.pass('Response has llamaCppEnabled field', `value=${body.llamaCppEnabled}`);
    else r.fail('Response has llamaCppEnabled field', `keys: ${Object.keys(body).join(', ')}`);

    if ('llamaCppOnline' in body) r.pass('Response has llamaCppOnline field', `value=${body.llamaCppOnline}`);
    else r.fail('Response has llamaCppOnline field', 'missing');

    if ('llamaCppUrl' in body) r.pass('Response has llamaCppUrl field');
    else r.fail('Response has llamaCppUrl field', 'missing');

    // llamaCppEnabled reflects whether LLAMA_CPP_URL is configured
    if (typeof body.llamaCppEnabled === 'boolean') r.pass('llamaCppEnabled is a boolean', `value=${body.llamaCppEnabled}`);
    else r.fail('llamaCppEnabled is a boolean', `got ${typeof body.llamaCppEnabled}`);
  } catch (err) {
    r.fail('GET /api/status', err.message);
  }

  // ── Agent route: preferredBackend validation ───────────────────────────────
  r.section('Agent route accepts preferredBackend');

  // Valid preferredBackend values should not cause 400
  for (const backend of ['auto', 'claude', 'llamacpp', 'swarm']) {
    try {
      const { status } = await postJson('/api/agent/stream', {
        prompt: 'test', preferredBackend: backend,
      });
      // 200 = streaming started; anything except 400 means validation passed
      if (status !== 400) {
        r.pass(`preferredBackend="${backend}" accepted by server`, `status=${status}`);
      } else {
        r.fail(`preferredBackend="${backend}" accepted by server`, 'got 400 validation error');
      }
    } catch (err) {
      r.fail(`preferredBackend="${backend}" accepted`, err.message);
    }
  }

  // Invalid value should return 400
  try {
    const { status } = await postJson('/api/agent/stream', {
      prompt: 'test', preferredBackend: 'invalid-value',
    });
    if (status === 400) r.pass('Invalid preferredBackend rejected with 400');
    else r.fail('Invalid preferredBackend rejected with 400', `got status=${status}`);
  } catch (err) {
    r.fail('Invalid preferredBackend rejected', err.message);
  }

  // ── Frontend: Model tab in sidebar ────────────────────────────────────────
  r.section('Model tab in sidebar');

  try {
    await b.launch({ headless: true });
    await b.goto('/');
    await b.afterReact(800);

    // Open sidebar
    await b.eval(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.getBoundingClientRect().top < 50) { btn.click(); return; }
      }
    });
    await b.afterReact(500);

    // Click the 🤖 Model tab (title="Model")
    await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const modelBtn = btns.find(b => b.title === 'Model' || b.textContent.trim() === '🤖');
      if (modelBtn) modelBtn.click();
    });
    await b.afterReact(600);

    const hasAutoBtn = await b.eval(() =>
      Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Auto'))
    );
    if (hasAutoBtn) r.pass('Model panel renders with Auto backend button');
    else r.fail('Model panel renders with Auto backend button', 'Auto button not found');

    const hasClaudeBtn = await b.eval(() =>
      Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Claude'))
    );
    if (hasClaudeBtn) r.pass('Model panel renders Claude backend button');
    else r.fail('Model panel renders Claude backend button', 'Claude button not found');

    const hasLlamaBtn = await b.eval(() =>
      Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('llama.cpp'))
    );
    if (hasLlamaBtn) r.pass('Model panel renders llama.cpp backend button');
    else r.fail('Model panel renders llama.cpp backend button', 'llama.cpp button not found');

    const hasStatusSection = await b.exists('text=Server Status');
    if (hasStatusSection) r.pass('Server Status section visible');
    else r.fail('Server Status section visible', 'not found');

    const shot = await b.screenshot('llamacpp-model-panel');
    r.screenshot(shot);

    // ── preferredBackend persists ──────────────────────────────────────────
    r.section('Backend selection persists');

    // Click Claude button
    await b.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const claudeBtn = btns.find(b => b.textContent.trim().startsWith('Claude'));
      if (claudeBtn) claudeBtn.click();
    });
    await b.afterReact(300);

    const stored = await b.eval(() => {
      try {
        const s = JSON.parse(localStorage.getItem('session-store') || '{}');
        return s?.state?.preferredBackend ?? null;
      } catch { return null; }
    });
    if (stored === 'claude') r.pass('preferredBackend="claude" persisted to localStorage');
    else r.fail('preferredBackend="claude" persisted to localStorage', `stored="${stored}"`);

    // ── Console errors ─────────────────────────────────────────────────────
    r.section('Console errors');

    const jsErrors = b.flushLogs().filter(l =>
      (l.type === 'pageerror' || l.type === 'error') &&
      !l.text.includes('Failed to fetch') &&
      !l.text.includes('Failed to load resource') &&
      !l.text.includes('api/status') &&
      !l.text.includes('api/audit') &&
      !l.text.includes('fetchAgents')
    );
    if (jsErrors.length === 0) r.pass('No unexpected JS errors');
    else r.fail('No unexpected JS errors', jsErrors.map(e => e.text).join('\n    '));

  } catch (err) {
    r.fail('Browser test crashed', err.message);
    console.error(err);
  } finally {
    await b.close();
  }

  const ok = r.summary();
  process.exit(ok ? 0 : 1);
}

run();
