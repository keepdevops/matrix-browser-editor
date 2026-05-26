# Matrix Editor

AI-powered React component editor with live preview, multi-backend AI (llama.cpp · Swarm · Claude), design tokens, animation presets, and one-click export.

## Quick Start

```bash
cd editor
npm install
npm run dev        # http://localhost:5173
```

The backend server (share links, file export, ZIP downloads) runs separately:

```bash
npm run server     # http://localhost:3001
```

## Features

- **AI Chat** — describe a component; attach a screenshot to edit visually; inline AI editing with diff preview
- **Live Preview** — real-time Babel render; responsive viewports (375px / 768px / full); split, themes, and inspector
- **Code Editor** — Monaco (TSX/JSX/TS/JS); Prettier; diff mode; version history; draft autosave
- **Templates** — 30+ prebuilt components ready to load and customise
- **Design Tokens** — CSS variables, Google Fonts, Dark/Light presets, AI palette generator
- **Animation** — preset library (Fade In, Slide Up, Bounce…) injected directly into component code
- **Canvas** — drag Library components onto a Puck canvas and export as `ComposedPage`
- **Export** — Download, ZIP, GitHub Gist, Storybook stories, AI-generated tests & docs, share links, filesystem injection
- **Model Panel** — switch between Auto / llama.cpp / Swarm / Claude with live server status

See [Capabilities.md](./Capabilities.md) for the full feature reference.

---

## Test Runner

Playwright-based browser test harness for the editor UI.

### Setup

```bash
npm install
npm run install:browsers   # downloads Chromium
```

### Run tests

```bash
node run.js --url http://localhost:5173        # all suites
node run.js sidebar --url http://localhost:5173  # one suite
node run.js --headed --url http://localhost:5173 # visible window
node run.js --no-server-check                    # skip connectivity check
```

### npm scripts

| Script | Suite |
|--------|-------|
| `npm test` | All tests |
| `npm run test:button` | Button component |
| `npm run test:layout` | Layout tests |
| `npm run test:components` | Component tests |
| `npm run test:share` | Share API |
| `npm run test:llamacpp` | llama.cpp backend |
| `npm run test:swarm-matrix` | Swarm matrix |

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Target app URL |
| `BROWSER_HEADLESS` | `1` | Set to `0` for headed mode |

### Write your own test

```js
// tests/my-feature.test.js
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();
  await b.launch({ headless: true });
  await b.goto('/');

  const title = await b.eval(() => document.querySelector('h1')?.textContent);
  if (title) r.pass('Page has heading', title);
  else r.fail('Page has heading');

  const shot = await b.screenshot('my-page');
  r.screenshot(shot);

  await b.close();
  r.summary();
}
run();
```

Screenshots are saved to `screenshots/` in this directory.

### BrowserSession API

| Method | Description |
|--------|-------------|
| `launch(opts)` | Start browser — `opts.headless`, `opts.baseUrl` |
| `goto(path)` | Navigate to path on baseUrl |
| `click(selector)` | Click element + wait for React |
| `type(selector, text)` | Fill input |
| `selectByValue(selector, value)` | Set `<select>` value |
| `text(selector)` | Get text content |
| `exists(selector)` | Boolean presence check |
| `screenshot(name)` | Save PNG to `screenshots/` |
| `urlParams()` | Current URL params as object |
| `eval(fn)` | Run JS in page context (no args — use `page.evaluate` for parameterised calls) |
| `flushLogs()` | Get + clear captured console logs |
| `close()` | Close browser |
