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
  recharts: [
    '<script crossorigin src="https://unpkg.com/prop-types@15/prop-types.min.js"></script>',
    '<script crossorigin src="https://unpkg.com/recharts@2/umd/Recharts.js"></script>',
  ],
  chartjs: [
    '<script crossorigin src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>',
    '<script crossorigin src="https://unpkg.com/react-chartjs-2@5/dist/index.umd.js"></script>',
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
    .replace(/\w<[A-Z][a-zA-Z]*>/g, (m) => m[0]) // strip TS generics like Array<T> but not JSX <Component>
    .replace(/import\s+type\s+[^;]+;/g, '');
}

function resolveCdnTags(code, styleSystem) {
  const tags = [...(CDN_MAP[styleSystem] || CDN_MAP.tailwind)];
  if (/from ['"]recharts['"]|require\(['"]recharts['"]\)/.test(code)) tags.push(...CDN_MAP.recharts);
  if (/from ['"]react-chartjs-2['"]|from ['"]chart\.js['"]/.test(code)) tags.push(...CDN_MAP.chartjs);
  return [...new Set(tags)].join('\n    ');
}

function buildHtml(code, styleSystem, theme) {
  const cdnTags = resolveCdnTags(code, styleSystem);
  const bg = theme === 'dark' ? '#0f172a' : '#f8fafc';
  const fg = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const darkClass = theme === 'dark' ? 'dark' : '';

  const nameMatch = code.match(/export\s+(?:default\s+)?function\s+(\w+)|export\s+(?:const|let)\s+(\w+)/);
  const componentName = nameMatch ? (nameMatch[1] || nameMatch[2]) : null;

  // Extract named imports from known UMD globals before stripping
  const rechartsMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]recharts['"]/);
  const chartjs2Match = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]react-chartjs-2['"]/);

  const strippedCode = stripTypeAnnotations(code)
    .replace(/^import\s+.*from\s+['"]react['"];?/m, '')
    .replace(/^import\s+.*from\s+['"]recharts['"];?/gm, '')
    .replace(/^import\s+.*from\s+['"]react-chartjs-2['"];?/gm, '')
    .replace(/^import\s+.*from\s+['"]chart\.js[^'"]*['"];?/gm, '')
    .replace(/^export\s+default\s+/m, 'window.__Component = ')
    .replace(/^export\s+(?:function|const|class)\s+(\w+)/m, (_, n) => `window.__Component = function ${n}`);

  const umdShims = [
    rechartsMatch ? `const { ${rechartsMatch[1].trim()} } = window.Recharts || {};` : '',
    chartjs2Match ? `const { ${chartjs2Match[1].trim()} } = window.ReactChartjs2 || {};` : '',
  ].filter(Boolean).join('\n    ');

  const renderCall = componentName
    ? `ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.__Component || ${componentName}, null));`
    : `ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.__Component, null));`;

  return `<!DOCTYPE html>
<html lang="en" class="${darkClass}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  ${cdnTags}
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>*{box-sizing:border-box}body{margin:0;padding:1rem;font-family:sans-serif;background:${bg};color:${fg}}#root{width:100%}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    ${umdShims}
    ${strippedCode}
    ${renderCall}
  </script>
</body>
</html>`;
}

async function screenshotComponent({ code, styleSystem = 'tailwind', theme = 'light', width = 800, height = 600 }) {
  const html = buildHtml(code, styleSystem, theme);
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height });
    await page.setContent(html, { waitUntil: 'load', timeout: 25000 });
    // wait for all CDN scripts to load and Babel to transform
    await page.waitForFunction(
      () => typeof window.React !== 'undefined' && typeof window.ReactDOM !== 'undefined' && typeof window.Babel !== 'undefined',
      { timeout: 15000 }
    ).catch(() => {});
    // wait for React to mount into #root
    await page.waitForFunction(() => document.getElementById('root')?.children.length > 0, { timeout: 10000 })
      .catch(() => {});
    // settle time for chart libraries using ResizeObserver / async layout
    await page.waitForTimeout(1500);
    const buffer = await page.screenshot({ type: 'png', fullPage: false });
    return buffer.toString('base64');
  } finally {
    await browser.close();
  }
}

module.exports = { screenshotComponent };
