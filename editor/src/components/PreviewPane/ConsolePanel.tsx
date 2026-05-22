import { useRef, useEffect } from 'react';
import type { LogEntry, LogLevel } from '../../hooks/useConsoleCapture';

interface Props {
  entries: LogEntry[];
  onClear: () => void;
}

const LEVEL_COLOR: Record<LogLevel, string> = {
  log:   '#94a3b8',
  info:  '#38bdf8',
  warn:  '#fbbf24',
  error: '#f87171',
};

const LEVEL_BG: Record<LogLevel, string> = {
  log:   'transparent',
  info:  'transparent',
  warn:  'rgba(251,191,36,0.06)',
  error: 'rgba(248,113,113,0.08)',
};

const LEVEL_ICON: Record<LogLevel, string> = {
  log:   '›',
  info:  'ℹ',
  warn:  '⚠',
  error: '✕',
};

export function ConsolePanel({ entries, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const errorCount = entries.filter(e => e.level === 'error').length;
  const warnCount  = entries.filter(e => e.level === 'warn').length;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 160, flexShrink: 0,
      borderTop: '1px solid #1e293b',
      background: '#080d18',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '3px 10px', borderBottom: '1px solid #1e293b',
        background: '#0a0f1e', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em' }}>CONSOLE</span>
          {errorCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', background: 'rgba(248,113,113,0.12)', borderRadius: 4, padding: '1px 5px' }}>
              {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
          {warnCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', borderRadius: 4, padding: '1px 5px' }}>
              {warnCount} warn{warnCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          title="Clear console"
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 11, padding: '1px 4px' }}
        >
          ⊘ Clear
        </button>
      </div>

      {/* Log entries */}
      <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
        {entries.length === 0 ? (
          <div style={{ color: '#334155', padding: '10px 12px', fontStyle: 'italic' }}>No output</div>
        ) : (
          entries.map(entry => (
            <div
              key={entry.id}
              style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: '2px 10px', background: LEVEL_BG[entry.level],
                borderBottom: '1px solid rgba(30,41,59,0.5)',
              }}
            >
              <span style={{ color: LEVEL_COLOR[entry.level], flexShrink: 0, fontSize: 12, lineHeight: '18px' }}>
                {LEVEL_ICON[entry.level]}
              </span>
              <span style={{ color: LEVEL_COLOR[entry.level], whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: '18px' }}>
                {entry.args.join(' ')}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
