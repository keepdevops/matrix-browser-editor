import { useEffect, useRef, useMemo } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';
import { buildSrcdoc, INSPECT_SCRIPT } from './useBuildSrcdoc';

export function usePreview(inspectMode = false) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const splitRef = useRef<HTMLIFrameElement>(null);
  const { code } = useEditorStore();
  const { styleSystem, theme } = useSessionStore();

  const srcdoc = useMemo(() => {
    const doc = buildSrcdoc(code, styleSystem, theme);
    if (!inspectMode) return doc;
    return doc.replace('</body>', `<script>${INSPECT_SCRIPT}<\/script>\n</body>`);
  }, [code, styleSystem, theme, inspectMode]);

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
