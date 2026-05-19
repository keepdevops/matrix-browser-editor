'use strict';

const { chromium } = require('playwright');

const CDN_MAP = {
  tailwind: ['<script src="https://cdn.tailwindcss.com"></script>'],
  shadcn:   ['<script src="https://cdn.tailwindcss.com"></script>'],
  mui: [
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>',
    '<script crossorigin src="https://unpkg.com/@mui/material@5/umd/material-ui.production.min.js"></script>',
  ],
  antd: [
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/5.12.8/reset.min.css"/>',
    '<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/antd/5.12.8/antd.min.js"></script>',
  ],
  chakra: ['<script crossorigin src="https://unpkg.com/@chakra-ui/react@2/dist/chakra-ui-react.umd.js"></script>'],
  mantine: [
    '<link rel="stylesheet" href="https://unpkg.com/@mantine/core@7/styles.css"/>',
    '<script crossorigin src="https://unpkg.com/@mantine/core@7/dist/mantine-core.umd.cjs"></script>',
  ],
};

function stripTypeAnnotations(code) {
  return code
    .replace(/:\s*React\.FC[^=]*/g, '')
    .replace(/:\s*React\.CSSProperties/g, '')
    .replace(/:\s*string(\s*[,)=\n])/g, '$1')
    .replace(/:\s*number(\s*[,)=\n])/g, '$1')
    .replace(/:\s*boolean(\s*[,)=\n])/g, '$1')
    .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
    .replace(/<[A-Z][a-zA-Z]*>/g, '')
    .replace(/import\s+type\s+[^;]+;/g, '');
}

function buildHtml(code, styleSystem, theme) {
  const cdnTags = (CDN_MAP[styleSystem] || CDN_MAP.tailwind).join('\n    ');
  const bg = theme === 'dark' ? '#0f172a' : '#f8fafc';
  const fg = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const darkClass = theme === 'dark' ? 'dark' : '';

  const nameMatch = code.match(/export\s+(?:default\s+)?function\s+(\w+)|export\s+(?:const|let)\s+(\w+)/);
  const componentName = nameMatch ? (nameMatch[1] || nameMatch[2]) : null;

  const strippedCode = stripTypeAnnotations(code)
    .replace(/^import\s+.*from\s+['"]react['"];?/m, '')
    .replace(/^export\s+default\s+/m, 'window.__Component = ')
    .replace(/^export\s+(?:function|const|class)\s+(\w+)/m, (_, n) => `window.__Component = function ${n}`);

  const renderCall = componentName
    ? `ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.__Component || ${componentName}, null));`
    : `ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.__Component, null));`;

  return `<!DOCTYPE html>
<html lang="en" class="${darkClass}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  ${cdnTags}
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>*{box-sizing:border-box}body{margin:0;padding:1rem;font-family:sans-serif;background:${bg};color:${fg}}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    ${strippedCode}
    ${renderCall}
  </script>
</body>
</html>`;
}

async function screenshotComponent({ code, styleSystem = 'tailwind', theme = 'light', width = 800, height = 600 }) {
  const html = buildHtml(code, styleSystem, theme);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 20000 });
    // wait for Babel to transform and React to render
    await page.waitForFunction(() => document.getElementById('root')?.children.length > 0, { timeout: 10000 })
      .catch(() => {}); // proceed even if root stays empty (render error in component)
    const buffer = await page.screenshot({ type: 'png', fullPage: false });
    return buffer.toString('base64');
  } finally {
    await browser.close();
  }
}

module.exports = { screenshotComponent };
