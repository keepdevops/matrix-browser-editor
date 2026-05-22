import { useMemo } from 'react';

interface DiffTooltipProps {
  oldCode: string;
  newCode: string;
  anchorTop: number;
}

type DiffLine = { type: 'same' | 'add' | 'remove'; text: string };

function computeDiff(oldCode: string, newCode: string): DiffLine[] {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');

  // Build LCS table
  const m = oldLines.length;
  const n = newLines.length;
  const limit = 300; // cap to avoid quadratic blowup on large files
  if (m > limit || n > limit) {
    // Fallback: just show first changed region
    const result: DiffLine[] = [];
    const maxShow = 40;
    for (let i = 0; i < Math.min(oldLines.length, maxShow); i++) result.push({ type: 'remove', text: oldLines[i] });
    for (let i = 0; i < Math.min(newLines.length, maxShow); i++) result.push({ type: 'add', text: newLines[i] });
    return result;
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = oldLines[i] === newLines[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && oldLines[i] === newLines[j]) {
      result.push({ type: 'same', text: oldLines[i] });
      i++; j++;
    } else if (j < n && (i >= m || dp[i + 1][j] < dp[i][j + 1])) {
      result.push({ type: 'add', text: newLines[j] });
      j++;
    } else {
      result.push({ type: 'remove', text: oldLines[i] });
      i++;
    }
  }
  return result;
}

const CONTEXT = 2;

function withContext(lines: DiffLine[]): (DiffLine & { show: boolean })[] {
  const changed = new Set<number>();
  lines.forEach((l, i) => { if (l.type !== 'same') { for (let k = Math.max(0, i - CONTEXT); k <= Math.min(lines.length - 1, i + CONTEXT); k++) changed.add(k); } });
  return lines.map((l, i) => ({ ...l, show: changed.has(i) }));
}

export function DiffTooltip({ oldCode, newCode, anchorTop }: DiffTooltipProps) {
  const diffLines = useMemo(() => computeDiff(oldCode, newCode), [oldCode, newCode]);
  const withCtx = useMemo(() => withContext(diffLines), [diffLines]);
  const visible = withCtx.filter(l => l.show);

  const added = diffLines.filter(l => l.type === 'add').length;
  const removed = diffLines.filter(l => l.type === 'remove').length;

  if (added === 0 && removed === 0) return (
    <div style={TOOLTIP_STYLE(anchorTop)}>
      <div style={{ padding: '8px 12px', fontSize: 11, color: '#475569' }}>No changes vs current</div>
    </div>
  );

  return (
    <div style={TOOLTIP_STYLE(anchorTop)}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 10, fontSize: 10 }}>
        <span style={{ color: '#4ade80' }}>+{added}</span>
        <span style={{ color: '#f87171' }}>−{removed}</span>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 320, fontFamily: 'monospace', fontSize: 11 }}>
        {visible.map((line, i) => {
          const prev = withCtx[withCtx.indexOf(line) - 1];
          const showEllipsis = i > 0 && prev && !prev.show;
          return (
            <div key={i}>
              {showEllipsis && <div style={{ padding: '1px 10px', color: '#334155', fontSize: 10 }}>···</div>}
              <div style={{
                padding: '1px 10px',
                background: line.type === 'add' ? 'rgba(74,222,128,0.08)' : line.type === 'remove' ? 'rgba(248,113,113,0.08)' : 'transparent',
                color: line.type === 'add' ? '#4ade80' : line.type === 'remove' ? '#f87171' : '#64748b',
                whiteSpace: 'pre',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '} {line.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TOOLTIP_STYLE = (anchorTop: number): React.CSSProperties => ({
  position: 'fixed',
  top: Math.min(anchorTop, window.innerHeight - 380),
  right: 308,
  width: 360,
  background: '#0a0f1e',
  border: '1px solid #1e293b',
  borderRadius: 8,
  boxShadow: '-4px 4px 20px rgba(0,0,0,0.6)',
  zIndex: 30,
  pointerEvents: 'none',
});
