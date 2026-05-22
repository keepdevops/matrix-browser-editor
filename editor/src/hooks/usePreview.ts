import { useEffect, useRef, useMemo } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';
import { buildSrcdoc, INSPECT_SCRIPT } from './useBuildSrcdoc';
import { useDebounce } from './useDebounce';

export { buildSrcdoc as buildSrcdocForTheme };

const PREVIEW_DEBOUNCE_MS = 300;

export function usePreview(inspectMode = false, extraProps?: Record<string, unknown>) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const splitRef = useRef<HTMLIFrameElement>(null);
  const { code } = useEditorStore();
  const { styleSystem, theme } = useSessionStore();

  const srcdoc = useMemo(() => {
    const doc = buildSrcdoc(code, styleSystem, theme, extraProps && Object.keys(extraProps).length ? extraProps : undefined);
    if (!inspectMode) return doc;
    return doc.replace('</body>', `<script>${INSPECT_SCRIPT}<\/script>\n</body>`);
  }, [code, styleSystem, theme, inspectMode, extraProps]);

  // Debounce the iframe write — avoids rebuilding the srcdoc on every keystroke
  const debouncedSrcdoc = useDebounce(srcdoc, PREVIEW_DEBOUNCE_MS);

  useEffect(() => {
    [iframeRef, splitRef].forEach((ref) => {
      const iframe = ref.current;
      if (!iframe) return;
      try { iframe.srcdoc = debouncedSrcdoc; } catch (err) {
        console.error('[usePreview] srcdoc error:', err);
      }
    });
  }, [debouncedSrcdoc]);

  return { iframeRef, splitRef };
}
