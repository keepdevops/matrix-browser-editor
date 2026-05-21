import React, { useEffect, useRef } from 'react';
import { buildSrcdoc } from '../../hooks/useBuildSrcdoc';

interface Props {
  code: string;
  propsJson: string;
  height: number;
  styleSystem: string;
  theme: string;
}

function safeParse(json: string): Record<string, unknown> {
  try { return JSON.parse(json) || {}; } catch { return {}; }
}

export const PuckItemFrame = React.memo(function PuckItemFrame({
  code, propsJson, height, styleSystem, theme,
}: Props) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const extraProps = safeParse(propsJson);
    try {
      ref.current.srcdoc = buildSrcdoc(code, styleSystem, theme, extraProps);
    } catch (err) {
      console.error('[PuckItemFrame] srcdoc error:', err);
    }
  }, [code, propsJson, styleSystem, theme]);

  return (
    <iframe
      ref={ref}
      title="Component preview"
      sandbox="allow-scripts"
      style={{
        width: '100%',
        height: Math.max(80, height),
        border: 'none',
        display: 'block',
        background: theme === 'dark' ? '#0f172a' : '#f8fafc',
      }}
    />
  );
});
