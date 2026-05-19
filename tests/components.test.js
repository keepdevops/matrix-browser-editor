/**
 * React component interaction tests.
 * Clicks buttons, fills inputs, verifies DOM responses.
 */
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();

  try {
    await b.launch({ headless: true });
    await b.goto('/');

    r.section('Header controls');

    const modeSelect = await b.exists('select.mode-selector, select[title*="mode" i], .mode-selector select');
    r.info(`Mode selector present: ${modeSelect}`);

    const configBtn = await b.exists('button.configure-button');
    if (configBtn) {
      r.pass('CONFIGURE button found');
      await b.click('button.configure-button');
      const panelShown = await b.exists('.swarm-config, .sc-container, [class*="config"]');
      if (panelShown) r.pass('Config panel toggles open on click');
      else r.fail('Config panel toggles open on click', 'no config panel element found');
      const shot1 = await b.screenshot('config-open');
      r.screenshot(shot1);

      await b.click('button.configure-button');
      r.info('Config panel toggled closed');
    } else {
      r.fail('CONFIGURE button found', 'button.configure-button not in DOM');
    }

    r.section('Prompt input');
    const promptArea = await b.exists('textarea, input[type="text"][placeholder]');
    if (promptArea) {
      r.pass('Prompt input present');
      const sel = (await b.exists('textarea')) ? 'textarea' : 'input[type="text"]';
      await b.type(sel, 'hello from browser automation');
      const val = await b.eval(() => {
        const el = document.querySelector('textarea') || document.querySelector('input[type="text"]');
        return el ? el.value : null;
      });
      if (val && val.includes('hello')) r.pass('Typing into prompt input works', `value="${val.slice(0, 40)}"`);
      else r.fail('Typing into prompt input works', `value="${val}"`);
      const shot2 = await b.screenshot('prompt-typed');
      r.screenshot(shot2);
    } else {
      r.fail('Prompt input present', 'no textarea or text input found');
    }

    r.section('Help modal');
    const helpBtn = await b.exists('button.help-button');
    if (helpBtn) {
      r.pass('Help button found');
      await b.click('button.help-button');
      const modalShown = await b.exists('.help-modal, [class*="help"]');
      if (modalShown) r.pass('Help modal opens on click');
      else r.fail('Help modal opens on click', 'no .help-modal found');
      const shot3 = await b.screenshot('help-modal');
      r.screenshot(shot3);
    } else {
      r.fail('Help button found', 'button.help-button not in DOM');
    }

    r.section('Layout-specific: Neo');
    await b.selectByValue('select[aria-label="Layout"]', 'neo');
    const neoNav = await b.exists('.neo-nav');
    if (neoNav) r.pass('Neo layout: .neo-nav sidebar rendered');
    else r.fail('Neo layout: .neo-nav sidebar rendered', '.neo-nav not found');

    const neoAgents = await b.exists('.neo-agents');
    if (neoAgents) r.pass('Neo layout: .neo-agents panel rendered');
    else r.fail('Neo layout: .neo-agents panel rendered', '.neo-agents not found');

    const collapseBtn = await b.exists('.neo-collapse-btn');
    if (collapseBtn) {
      await b.click('.neo-collapse-btn');
      const collapsed = await b.exists('.neo-body--nav-collapsed');
      if (collapsed) r.pass('Neo layout: nav collapse button works');
      else r.fail('Neo layout: nav collapse button works', '.neo-body--nav-collapsed not applied');
      const shot4 = await b.screenshot('neo-collapsed');
      r.screenshot(shot4);
    }

    r.section('Layout-specific: Operator');
    await b.selectByValue('select[aria-label="Layout"]', 'operator');
    const opTopband = await b.exists('.op-topband');
    if (opTopband) r.pass('Operator layout: .op-topband rendered');
    else r.fail('Operator layout: .op-topband rendered', '.op-topband not found');
    const shot5 = await b.screenshot('operator');
    r.screenshot(shot5);

    r.section('Layout-specific: Results');
    await b.selectByValue('select[aria-label="Layout"]', 'results');
    const rlHeader = await b.exists('.rl-header');
    if (rlHeader) r.pass('Results layout: .rl-header rendered');
    else r.fail('Results layout: .rl-header rendered', '.rl-header not found');
    const shot6 = await b.screenshot('results');
    r.screenshot(shot6);

    r.section('Console errors check');
    const allLogs = b.flushLogs();
    const jsErrors = allLogs.filter(l =>
      (l.type === 'pageerror' || l.type === 'error') &&
      !l.text.includes('503') && !l.text.includes('Failed to fetch') && !l.text.includes('fetchAgents') && !l.text.includes('loadHistory')
    );
    if (jsErrors.length === 0) r.pass('No JS errors across all tests');
    else r.fail('No JS errors across all tests', jsErrors.map(e => e.text).join('\n    '));

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
