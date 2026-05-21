import { useEffect, useRef, useMemo } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';

const CDN: Record<string, string[]> = {
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

// No manual stripping needed — Babel standalone handles TS via data-presets="react,typescript"

function resolveCdnTags(code: string, styleSystem: string): string {
  const tags = [...(CDN[styleSystem] || CDN.tailwind)];
  if (/from ['"]recharts['"]|require\(['"]recharts['"]\)/.test(code)) tags.push(...(CDN.recharts ?? []));
  if (/from ['"]react-chartjs-2['"]|from ['"]chart\.js['"]/.test(code)) tags.push(...(CDN.chartjs ?? []));
  return [...new Set(tags)].join('\n    ');
}

function buildSrcdoc(code: string, styleSystem: string, theme: string): string {
  const cdnTags = resolveCdnTags(code, styleSystem);
  const bg = theme === 'dark' ? '#0f172a' : '#f8fafc';
  const fg = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const darkClass = theme === 'dark' ? 'dark' : '';

  // Extract the exported component name
  const nameMatch = code.match(/export\s+default\s+function\s+(\w+)/) ||
    code.match(/export\s+(?:function|class)\s+(\w+)/) ||
    code.match(/export\s+(?:const|let)\s+(\w+)/) ||
    code.match(/export\s+default\s+(\w+)/);
  const componentName = nameMatch ? nameMatch[1] : null;

  const rechartsMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]recharts['"]/);
  const chartjs2Match = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]react-chartjs-2['"]/);

  // Strip CDN-provided imports and expose the component on window for rendering
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
// Common demo props to satisfy typical generated components that require props
const __demoProps = {
  title:'Demo Title', name:'Demo', label:'Demo', description:'A sample component.',
  price:'$99', plan:'Pro', buttonText:'Get Started', ctaText:'Learn More',
  features:['Fast performance','Easy to use','Fully responsive'],
  items:[{id:1,label:'Item 1'},{id:2,label:'Item 2'},{id:3,label:'Item 3'}],
  data:[{x:1,y:10},{x:2,y:20},{x:3,y:15}],
  children:null, value:'', count:0, total:0, isActive:false, isHighlighted:true,
  isOpen:false, isLoading:false, disabled:false, checked:false,
  onClick:function(){}, onChange:function(){}, onSubmit:function(){},
  onSubscribe:function(){}, onClose:function(){}, onSelect:function(){},
  subtitle:'Subtitle text', heading:'Heading', text:'Sample text',
  src:'https://picsum.photos/400/300', alt:'Demo image', href:'#',
  color:'#6366f1', size:'md', variant:'primary', type:'button',
  placeholder:'Enter text...', message:'Hello, world!',
  user:{name:'Jane Doe', email:'jane@example.com', avatar:'https://i.pravatar.cc/40'},
  stats:[{label:'Users',value:'1.2k'},{label:'Revenue',value:'$4.5k'},{label:'Growth',value:'+12%'}],
};
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(ErrorBoundary,null,React.createElement(window.__Component,__demoProps))
);`;

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
  <style>*{box-sizing:border-box}body{margin:0;padding:1rem;font-family:sans-serif;background:${bg};color:${fg}}</style>
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

export function usePreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const splitRef = useRef<HTMLIFrameElement>(null);
  const { code } = useEditorStore();
  const { styleSystem, theme } = useSessionStore();

  const srcdoc = useMemo(() => buildSrcdoc(code, styleSystem, theme), [code, styleSystem, theme]);

  useEffect(() => {
    [iframeRef, splitRef].forEach((ref) => {
      const iframe = ref.current;
      if (!iframe) return;
      try { iframe.srcdoc = srcdoc; } catch (err) {
        console.error('[usePreview] srcdoc error:', err);
      }
    });
  }, [srcdoc]);

  return { iframeRef, splitRef };
}
