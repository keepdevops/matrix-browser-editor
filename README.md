# matrix-browser-editor

Standalone browser automation tool for testing and interacting with React UIs using Playwright.

## Setup

```bash
npm install
npm run install:browsers   # downloads Chromium
```

## Run tests

```bash
node run.js                          # all tests
node run.js layouts                  # layouts.test.js only
node run.js components               # components.test.js only
node run.js --headed                 # visible Chrome window
node run.js --url http://localhost:4000   # different target
node run.js --no-server-check        # skip connectivity check
```

## Environment variables

| Variable          | Default                    | Description              |
|-------------------|----------------------------|--------------------------|
| `BASE_URL`        | `http://localhost:3000`    | Target app URL           |
| `BROWSER_HEADLESS`| `1`                        | Set to `0` for headed    |

## Write your own test

```js
// tests/my-feature.test.js
const { BrowserSession } = require('../lib/browser');
const { Reporter }       = require('../lib/reporter');

async function run() {
  const r = new Reporter();
  const b = new BrowserSession();
  await b.launch({ headless: true });
  await b.goto('/my-page');

  const title = await b.text('h1');
  if (title) r.pass('Page has heading', title);
  else r.fail('Page has heading');

  const shot = await b.screenshot('my-page');
  r.screenshot(shot);

  await b.close();
  r.summary();
}
run();
```

## API

| Method | Description |
|--------|-------------|
| `launch(opts)` | Start browser. `opts.headless`, `opts.baseUrl` |
| `goto(path)` | Navigate to path on baseUrl |
| `click(selector)` | Click element + wait for React |
| `type(selector, text)` | Fill input |
| `selectByValue(selector, value)` | Set `<select>` value |
| `text(selector)` | Get text content |
| `exists(selector)` | Boolean presence check |
| `screenshot(name)` | Save PNG to `screenshots/` |
| `urlParams()` | Current URL params as object |
| `eval(fn)` | Run JS in page context |
| `flushLogs()` | Get + clear captured console logs |
| `close()` | Close browser |

Screenshots are saved to `screenshots/` in this directory.
# matrix-browser-editor
