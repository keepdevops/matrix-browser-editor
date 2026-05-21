import { useCallback } from 'react';
import type { Data } from '@measured/puck';
import { useEditorStore } from '../../store/editorStore';
import { useLibraryStore } from '../../store/libraryStore';

function safeParse(json: string): Record<string, unknown> {
  try { return JSON.parse(json) || {}; } catch { return {}; }
}

function stripExports(code: string, name: string): string {
  return code
    .replace(/^import\s[^;]+;?\s*/gm, '')
    .replace(/^export\s+default\s+function\s+\w+/, `function ${name}`)
    .replace(/^export\s+default\s+class\s+\w+/, `class ${name}`)
    .replace(/^export\s+default\s+\w+\s*;?\s*$/m, '')
    .replace(/^export\s+(function|class|const|let)\s+(\w+)/, (_, kw, n) => `${kw} ${n}`)
    .trim();
}

export function useCanvasExport() {
  const { setCode, setComponentName } = useEditorStore();
  const { components: library } = useLibraryStore();

  const exportToCode = useCallback((data: Data, currentCode: string, currentName: string): string => {
    if (!data.content.length) return '';

    const seen = new Set<string>();
    const definitions: string[] = [];
    const jsxLines: string[] = [];

    data.content.forEach((item) => {
      const isCurrentComponent = item.type.startsWith('__current_');
      const libName = isCurrentComponent ? null : item.type.replace(/[^a-zA-Z0-9_]/g, '_');
      const libItem = libName ? library.find(c => c.name.replace(/[^a-zA-Z0-9_]/g, '_') === libName) : null;
      const code = libItem ? libItem.code : (isCurrentComponent ? currentCode : null);
      const displayName = libItem ? libItem.name : (isCurrentComponent ? currentName : item.type);
      const safeName = displayName.replace(/[^a-zA-Z0-9_]/g, '_');

      if (code && !seen.has(safeName)) {
        seen.add(safeName);
        definitions.push(stripExports(code, safeName));
      }

      const propsJson = (item.props as { propsJson?: string }).propsJson || '{}';
      const props = safeParse(propsJson);
      const propsStr = Object.entries(props)
        .map(([k, v]) => `${k}={${JSON.stringify(v)}}`)
        .join(' ');
      jsxLines.push(`      <${safeName}${propsStr ? ' ' + propsStr : ''} />`);
    });

    return [
      `// ComposedPage — generated from Canvas`,
      definitions.join('\n\n'),
      '',
      `export default function ComposedPage() {`,
      `  return (`,
      `    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>`,
      ...jsxLines,
      `    </div>`,
      `  );`,
      `}`,
    ].join('\n');
  }, [library]);

  const sendToEditor = useCallback((data: Data, currentCode: string, currentName: string) => {
    const output = exportToCode(data, currentCode, currentName);
    if (!output) return;
    setCode(output);
    setComponentName('ComposedPage');
  }, [exportToCode, setCode, setComponentName]);

  return { exportToCode, sendToEditor };
}
