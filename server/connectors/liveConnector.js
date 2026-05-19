'use strict';

const path = require('path');

async function liveInject({ targetUrl, componentCode, componentName, screenshotDir }) {
  let BrowserSession;
  try {
    BrowserSession = require(path.join(__dirname, '../../lib/browser'));
  } catch (err) {
    console.error('[liveConnector] failed to load browser lib:', err.message);
    throw new Error('Browser automation library not available');
  }

  const session = new BrowserSession({
    baseUrl: targetUrl,
    headless: true,
    screenshotDir: screenshotDir || path.join(__dirname, '../../screenshots'),
  });

  try {
    await session.start();
    await session.goto(targetUrl);
    await session.afterReact();

    const injectedName = componentName || 'InjectedComponent';
    await session.page.evaluate(
      ({ code, name }) => {
        const script = document.createElement('script');
        script.type = 'text/babel';
        script.textContent = code;
        script.setAttribute('data-component', name);
        document.head.appendChild(script);

        const container = document.createElement('div');
        container.id = `live-inject-${name}`;
        container.style.cssText = 'position:fixed;bottom:0;right:0;z-index:9999;max-width:400px;';
        document.body.appendChild(container);
      },
      { code: componentCode, name: injectedName }
    );

    await session.afterReact();

    const screenshotPath = await session.screenshot(`live-inject-${injectedName}`);
    return { success: true, screenshotPath, componentName: injectedName };
  } catch (err) {
    console.error('[liveConnector] injection error:', err.message);
    throw err;
  } finally {
    await session.stop().catch((e) => console.error('[liveConnector] stop error:', e.message));
  }
}

module.exports = { liveInject };
