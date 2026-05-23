// Shared srcdoc builder — used by usePreview and PuckItemFrame

export const CDN: Record<string, string[]> = {
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

const KNOWN_PKGS = new Set(['react', 'react-dom', 'recharts', 'react-chartjs-2', 'chart.js',
  '@mui/material', 'antd', '@chakra-ui/react', '@mantine/core']);

export function extractUnknownImports(code: string): string[] {
  const re = /from\s+['"](@?[a-z0-9][\w.-]*(?:\/[^'"]*)?)['"]/g;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const pkg = m[1].startsWith('@') ? m[1].split('/').slice(0, 2).join('/') : m[1].split('/')[0];
    if (!KNOWN_PKGS.has(pkg) && !pkg.startsWith('.')) found.add(pkg);
  }
  return [...found];
}

export function resolveCdnTags(code: string, styleSystem: string): string {
  const tags = [...(CDN[styleSystem] || CDN.tailwind)];
  if (/from ['"]recharts['"]|require\(['"]recharts['"]\)/.test(code)) tags.push(...(CDN.recharts ?? []));
  if (/from ['"]react-chartjs-2['"]|from ['"]chart\.js['"]/.test(code)) tags.push(...(CDN.chartjs ?? []));
  return [...new Set(tags)].join('\n    ');
}

const cdnCache = new Map<string, string>();

export async function resolveCdnImportMap(packages: string[]): Promise<string> {
  if (!packages.length) return '';
  const toFetch = packages.filter(p => !cdnCache.has(p));
  if (toFetch.length) {
    try {
      const SERVER = (import.meta as { env?: Record<string, string> }).env?.VITE_SERVER_URL ?? 'http://localhost:3001';
      const res = await fetch(`${SERVER}/api/cdn-resolve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages: toFetch }),
      });
      if (res.ok) {
        const data: { resolved: Record<string, string> } = await res.json();
        Object.entries(data.resolved).forEach(([k, v]) => cdnCache.set(k, v));
      }
    } catch (err) { console.error('[useBuildSrcdoc] cdn-resolve error:', err); }
  }
  const imports: Record<string, string> = {};
  packages.forEach(p => { if (cdnCache.has(p)) imports[p] = cdnCache.get(p)!; });
  if (!Object.keys(imports).length) return '';
  return `<script type="importmap">${JSON.stringify({ imports })}</script>`;
}

export function buildSrcdoc(code: string, styleSystem: string, theme: string, extraProps?: Record<string, unknown>): string {
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

  const demoProps = {
    title: 'Demo Title', name: 'Demo', label: 'Demo', description: 'A sample component.',
    price: '$99', plan: 'Pro', buttonText: 'Get Started', ctaText: 'Learn More',
    features: ['Fast performance', 'Easy to use', 'Fully responsive'],
    items: [{ id: 1, label: 'Item 1' }, { id: 2, label: 'Item 2' }, { id: 3, label: 'Item 3' }],
    data: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }],
    children: null, value: '', count: 0, total: 0, isActive: false, isHighlighted: true,
    isOpen: false, isLoading: false, disabled: false, checked: false,
    onClick: 'function(){}', onChange: 'function(){}', onSubmit: 'function(){}',
    onSubscribe: 'function(){}', onClose: 'function(){}', onSelect: 'function(){}',
    subtitle: 'Subtitle text', heading: 'Heading', text: 'Sample text',
    src: 'https://picsum.photos/400/300', alt: 'Demo image', href: '#',
    color: '#6366f1', size: 'md', variant: 'primary', type: 'button',
    placeholder: 'Enter text...', message: 'Hello, world!',
    user: { name: 'Jane Doe', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/40' },
    stats: [{ label: 'Users', value: '1.2k' }, { label: 'Revenue', value: '$4.5k' }, { label: 'Growth', value: '+12%' }],
    ...extraProps,
  };

  const renderCall = `
class ErrorBoundary extends React.Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(e){return {err:e};}
  render(){
    if(this.state.err){
      return React.createElement('div',{style:{padding:'16px',color:'#f87171',fontFamily:'monospace',fontSize:13,background:'#1a0a0a',borderRadius:8,margin:8}},
        React.createElement('b',null,'Preview error: '),
        String(this.state.err.message||this.state.err)
      );
    }
    return this.props.children;
  }
}
const __demoProps = ${JSON.stringify(demoProps).replace(/"function\(\)\{\}"/g, 'function(){}')};
const __root = ReactDOM.createRoot(document.getElementById('root'));
if (typeof window.__Component === 'function') {
  __root.render(React.createElement(ErrorBoundary,null,React.createElement(window.__Component,__demoProps)));
} else {
  __root.render(React.createElement('div',{style:{padding:'16px',color:'#475569',fontFamily:'monospace',fontSize:13}},'No component exported yet.'));
}`;

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
  <style>*{box-sizing:border-box}body{margin:0;padding:0;font-family:sans-serif;background:${bg};color:${fg}}#root{min-height:100%;display:flex;flex-direction:column}</style>
  <script>${CONSOLE_SCRIPT}</script>
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

export const CONSOLE_SCRIPT = `
(function(){
  var _send = function(level, args) {
    var serialized = Array.from(args).map(function(a) {
      try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
      catch(e) { return String(a); }
    });
    window.parent.postMessage({ type: 'console', level: level, args: serialized }, '*');
  };
  ['log','warn','error','info'].forEach(function(level) {
    var orig = console[level].bind(console);
    console[level] = function() { orig.apply(console, arguments); _send(level, arguments); };
  });
  window.addEventListener('error', function(e) {
    _send('error', [e.message + (e.filename ? ' (' + e.filename + ':' + e.lineno + ')' : '')]);
  });
  window.addEventListener('unhandledrejection', function(e) {
    _send('error', ['Unhandled promise rejection: ' + String(e.reason)]);
  });
})();
`;

export const INSPECT_SCRIPT = `
(function(){
  document.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    var el = e.target;
    var cs = window.getComputedStyle(el);
    var styles = {};
    ['color','background-color','font-size','font-family','padding','margin',
     'border-radius','display','flex-direction','gap','width','height'].forEach(function(p){
      styles[p] = cs.getPropertyValue(p);
    });
    var rect = el.getBoundingClientRect();
    window.parent.postMessage({
      type:'inspect',
      payload:{
        tagName: el.tagName.toLowerCase(),
        id: el.id || '',
        classes: Array.from(el.classList),
        styles: styles,
        text: (el.textContent || '').slice(0,80).trim(),
        outerHTML: el.outerHTML.slice(0, 500),
        rect: { width: Math.round(rect.width), height: Math.round(rect.height) }
      }
    },'*');
  }, true);
})();
`;
