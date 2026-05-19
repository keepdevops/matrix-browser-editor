/**
 * Simple pass/fail reporter for browser test suites.
 */
const path = require('path');

class Reporter {
  constructor() {
    this.results = [];
    this.start   = Date.now();
  }

  pass(name, detail = '') {
    this.results.push({ status: 'PASS', name, detail });
    const d = detail ? `  ${detail}` : '';
    process.stdout.write(`  \x1b[32m✓\x1b[0m ${name}${d}\n`);
  }

  fail(name, detail = '') {
    this.results.push({ status: 'FAIL', name, detail });
    const d = detail ? `  ${detail}` : '';
    process.stdout.write(`  \x1b[31m✗\x1b[0m ${name}${d}\n`);
  }

  info(msg) {
    process.stdout.write(`  \x1b[36m·\x1b[0m ${msg}\n`);
  }

  section(name) {
    process.stdout.write(`\n\x1b[1m${name}\x1b[0m\n`);
  }

  screenshot(file) {
    this.info(`screenshot → ${path.relative(process.cwd(), file)}`);
  }

  summary() {
    const elapsed = ((Date.now() - this.start) / 1000).toFixed(1);
    const passed  = this.results.filter(r => r.status === 'PASS').length;
    const failed  = this.results.filter(r => r.status === 'FAIL').length;
    process.stdout.write(`\n${'─'.repeat(50)}\n`);
    process.stdout.write(`${passed} passed, ${failed} failed  (${elapsed}s)\n`);
    if (failed > 0) {
      process.stdout.write('\nFailed:\n');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        process.stdout.write(`  ✗ ${r.name}: ${r.detail}\n`);
      });
    }
    return failed === 0;
  }
}

module.exports = { Reporter };
