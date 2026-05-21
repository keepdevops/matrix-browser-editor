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

// TypeScript stripping handled by Babel tsx preset — no manual stripping needed

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

  const rechartsMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]recharts['"]/);
  const chartjs2Match = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]react-chartjs-2['"]/);

  const strippedCode = code
    .replace(/^import\s+.*from\s+['"]react['"];?/mg, '')
    .replace(/^import\s+.*from\s+['"]recharts['"];?/gm, '')
    .replace(/^import\s+.*from\s+['"]react-chartjs-2['"];?/gm, '')
    .replace(/^import\s+.*from\s+['"]chart\.js[^'"]*['"];?/gm, '')
    .replace(/^export\s+default\s+/m, 'window.__Component = ')
    .replace(/^export\s+(?:function|const|class)\s+(\w+)/m, (_, n) => `window.__Component = window.${n} = function ${n}`);

  const umdShims = [
    rechartsMatch ? `const { ${rechartsMatch[1].trim()} } = window.Recharts || {};` : '',
    chartjs2Match ? `const { ${chartjs2Match[1].trim()} } = window.ReactChartjs2 || {};` : '',
  ].filter(Boolean).join('\n    ');

  const demoProps = `{title:'Demo Title',name:'Demo',label:'Demo',description:'A sample component.',price:'$99',plan:'Pro',buttonText:'Get Started',features:['Feature 1','Feature 2','Feature 3'],items:[{id:1,label:'Item 1'},{id:2,label:'Item 2'}],data:[{x:1,y:10},{x:2,y:20}],children:null,value:'',count:0,isActive:false,isHighlighted:true,isOpen:false,isLoading:false,onClick:function(){},onChange:function(){},onSubmit:function(){},onSubscribe:function(){},onClose:function(){},subtitle:'Subtitle',heading:'Heading',src:'https://picsum.photos/400/300',alt:'Demo',user:{name:'Jane Doe',email:'jane@example.com'}}`;

  const renderCall = `
class ErrorBoundary extends React.Component{constructor(p){super(p);this.state={err:null};}static getDerivedStateFromError(e){return{err:e};}render(){if(this.state.err){return React.createElement('div',{style:{padding:'16px',color:'#f87171',fontFamily:'monospace',fontSize:13,background:'#1a0a0a',borderRadius:8}},'Preview error: '+String(this.state.err.message||this.state.err));}return this.props.children;}}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ErrorBoundary,null,React.createElement(window.__Component,${demoProps})));`;

  return `<!DOCTYPE html>
<html lang="en" class="${darkClass}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  ${cdnTags}
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>Babel.registerPreset('tsx',{presets:[[Babel.availablePresets['typescript'],{allExtensions:true,isTSX:true}],Babel.availablePresets['react']]});</script>
  <style>*{box-sizing:border-box}body{margin:0;padding:1rem;font-family:sans-serif;background:${bg};color:${fg}}#root{width:100%}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="tsx">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    ${umdShims}
    ${strippedCode}
    ${renderCall}
  </script>
</body>
</html>`;
}

// Reuse a single browser instance across requests to avoid launch contention
let _browser = null;
async function getBrowser() {
  if (_browser && _browser.isConnected()) return _browser;
  _browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  _browser.on('disconnected', () => { _browser = null; });
  return _browser;
}

async function screenshotComponent({ code, styleSystem = 'tailwind', theme = 'light', width = 800, height = 600 }) {
  console.log('[screenshotter] starting capture...');
  const html = buildHtml(code, styleSystem, theme);
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewportSize({ width, height });
    await page.setContent(html, { waitUntil: 'commit', timeout: 30000 });
    await page.waitForFunction(
      () => typeof window.React !== 'undefined' && typeof window.ReactDOM !== 'undefined' && typeof window.Babel !== 'undefined',
      { timeout: 20000 }
    ).catch(() => { console.warn('[screenshotter] CDN scripts timed out'); });
    await page.waitForFunction(() => document.getElementById('root')?.children.length > 0, { timeout: 10000 })
      .catch(() => {});
    await page.waitForTimeout(1000);
    const buffer = await page.screenshot({ type: 'png', fullPage: false });
    console.log('[screenshotter] capture done, size:', buffer.length);
    return buffer.toString('base64');
  } finally {
    await page.close();
  }
}

module.exports = { screenshotComponent };
