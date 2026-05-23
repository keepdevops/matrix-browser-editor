import { useEffect, useRef, useCallback } from 'react';
import { parse } from '@babel/parser';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';
import { buildSrcdoc, INSPECT_SCRIPT } from './useBuildSrcdoc';
import { useDebounce } from './useDebounce';

export { buildSrcdoc as buildSrcdocForTheme };

const PREVIEW_DEBOUNCE_MS = 300;

function isValidCode(code: string): boolean {
  try {
    parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    return true;
  } catch {
    return false;
  }
}

export function usePreview(inspectMode = false, extraProps?: Record<string, unknown>) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const splitRef = useRef<HTMLIFrameElement>(null);
  const { code } = useEditorStore();
  const { styleSystem, theme } = useSessionStore();

  // Debounce the raw code — only rebuild srcdoc after typing pauses
  const debouncedCode = useDebounce(code, PREVIEW_DEBOUNCE_MS);

  const writeToIframes = useCallback((srcdoc: string) => {
    [iframeRef, splitRef].forEach((ref) => {
      const iframe = ref.current;
      if (!iframe) return;
      try { iframe.srcdoc = srcdoc; } catch (err) {
        console.error('[usePreview] srcdoc error:', err);
      }
    });
  }, []);

  useEffect(() => {
    // Skip update if code is syntactically invalid — keeps last valid preview visible
    if (!isValidCode(debouncedCode)) return;

    const extraPropsArg = extraProps && Object.keys(extraProps).length ? extraProps : undefined;
    let srcdoc = buildSrcdoc(debouncedCode, styleSystem, theme, extraPropsArg);
    if (inspectMode) srcdoc = srcdoc.replace('</body>', `<script>${INSPECT_SCRIPT}<\/script>\n</body>`);
    writeToIframes(srcdoc);
  }, [debouncedCode, styleSystem, theme, inspectMode, extraProps, writeToIframes]);

  return { iframeRef, splitRef };
}
