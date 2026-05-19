/**
 * Core browser session wrapper around Playwright.
 * Provides screenshot, console capture, and React-aware interaction helpers.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

class BrowserSession {
  constructor() {
    this.browser = null;
    this.page    = null;
    this.logs    = [];
  }

  async launch({ headless = true, baseUrl = process.env.BASE_URL || 'http://localhost:3000' } = {}) {
    this.baseUrl = baseUrl;
    this.browser = await chromium.launch({ headless });
    const ctx  = await this.browser.newContext({ viewport: { width: 1280, height: 800 } });
    this.page  = await ctx.newPage();

    this.page.on('console', msg => {
      const entry = { type: msg.type(), text: msg.text(), time: Date.now() };
      this.logs.push(entry);
      if (msg.type() === 'error') process.stderr.write(`[browser:error] ${msg.text()}\n`);
    });

    this.page.on('pageerror', err => {
      const entry = { type: 'pageerror', text: err.message, time: Date.now() };
      this.logs.push(entry);
      process.stderr.write(`[browser:pageerror] ${err.message}\n`);
    });
  }

  async goto(path = '/') {
    await this.page.goto(`${this.baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(800);
  }

  /** Wait for React to finish rendering after an interaction. */
  async afterReact(ms = 600) {
    await this.page.waitForTimeout(ms);
  }

  async screenshot(name) {
    ensureScreenshotsDir();
    const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await this.page.screenshot({ path: file, fullPage: false });
    return file;
  }

  /** Select a value in a <select> by its value attribute. */
  async selectByValue(selector, value) {
    await this.page.selectOption(selector, value);
    await this.afterReact();
  }

  /** Click an element matching selector. */
  async click(selector) {
    await this.page.click(selector);
    await this.afterReact();
  }

  /** Type text into a focused / targeted element. */
  async type(selector, text) {
    await this.page.fill(selector, text);
  }

  /** Read the current URL search params as an object. */
  async urlParams() {
    const url = new URL(this.page.url());
    return Object.fromEntries(url.searchParams.entries());
  }

  /** Grab text content of an element (returns null if not found). */
  async text(selector) {
    try {
      return await this.page.textContent(selector, { timeout: 3000 });
    } catch {
      return null;
    }
  }

  /** Return whether a selector exists in the DOM. */
  async exists(selector) {
    return (await this.page.$(selector)) !== null;
  }

  /** Evaluate JS in page context. */
  async eval(fn) {
    return this.page.evaluate(fn);
  }

  /** Flush and return console logs since last call. */
  flushLogs() {
    const out = [...this.logs];
    this.logs = [];
    return out;
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

module.exports = { BrowserSession };
