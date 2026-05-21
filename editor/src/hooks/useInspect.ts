import { useState, useEffect, useCallback } from 'react';

export interface InspectInfo {
  tagName: string;
  id: string;
  classes: string[];
  styles: Record<string, string>;
  text: string;
  rect: { width: number; height: number };
}

export function useInspect(enabled: boolean) {
  const [info, setInfo] = useState<InspectInfo | null>(null);

  useEffect(() => {
    if (!enabled) { setInfo(null); return; }

    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'inspect') return;
      setInfo(e.data.payload as InspectInfo);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [enabled]);

  const dismiss = useCallback(() => setInfo(null), []);

  return { info, dismiss };
}

export const INSPECT_SCRIPT = `
(function(){
  var hl = null;
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
        rect: { width: Math.round(rect.width), height: Math.round(rect.height) }
      }
    },'*');
  }, true);
})();
`;
