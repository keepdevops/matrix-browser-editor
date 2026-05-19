#!/usr/bin/env node
/**
 * Browser test runner — standalone, no project dependencies.
 *
 * Usage:
 *   node run.js                         # run all test files
 *   node run.js layouts                 # run tests/layouts.test.js
 *   node run.js components              # run tests/components.test.js
 *   node run.js --headed                # run with visible browser
 *   node run.js --url http://localhost:3000
 *   node run.js --no-server-check       # skip connectivity pre-check
 *
 * Environment variables (override CLI flags):
 *   BASE_URL          target app URL (default: http://localhost:3000)
 *   BROWSER_HEADLESS  set to "0" for headed mode
 */
const { spawnSync } = require('child_process');
const path   = require('path');
const fs     = require('fs');

const args          = process.argv.slice(2);
const headed        = args.includes('--headed') || process.env.BROWSER_HEADLESS === '0';
const noServerCheck = args.includes('--no-server-check');
const urlIdx        = args.indexOf('--url');
const baseUrl       = (urlIdx !== -1 ? args[urlIdx + 1] : null)
                   || process.env.BASE_URL
                   || 'http://localhost:3000';

const skipArgs = new Set(['--headed', '--no-server-check']);
if (urlIdx !== -1) { skipArgs.add('--url'); skipArgs.add(args[urlIdx + 1]); }
const filter = args.filter(a => !skipArgs.has(a));

const testsDir = path.join(__dirname, 'tests');
if (!fs.existsSync(testsDir)) {
  console.error('No tests/ directory found.');
  process.exit(1);
}

const files = fs.readdirSync(testsDir)
  .filter(f => f.endsWith('.test.js'))
  .filter(f => filter.length === 0 || filter.some(k => f.includes(k)));

if (files.length === 0) {
  console.error('No test files matched:', filter.join(', ') || '*');
  process.exit(1);
}

if (!noServerCheck) {
  const check = spawnSync('curl', ['-sf', '-o', '/dev/null', '--max-time', '4', baseUrl]);
  if (check.status !== 0) {
    console.error(`\nERROR: App not reachable at ${baseUrl}`);
    console.error('Pass --no-server-check to skip, or --url <url> to target a different app.\n');
    process.exit(1);
  }
}

console.log(`\nTarget: ${baseUrl}  |  headed: ${headed}  |  files: ${files.length}\n`);

let anyFailed = false;
for (const file of files) {
  const filePath = path.join(testsDir, file);
  console.log(`\x1b[1m▶ ${file}\x1b[0m`);
  const env = { ...process.env, BROWSER_HEADLESS: headed ? '0' : '1', BASE_URL: baseUrl };
  const result = spawnSync('node', [filePath], { stdio: 'inherit', env });
  if (result.status !== 0) anyFailed = true;
}

process.exit(anyFailed ? 1 : 0);
