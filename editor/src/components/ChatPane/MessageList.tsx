import { useEffect, useRef, useMemo } from 'react';
import type { AgentMessage } from '../../lib/schemas';
import type { ParsedComponent } from '../../lib/schemas';

// Keyword → contextual follow-up suggestions
const CONTEXTUAL: Array<{ keywords: RegExp; suggestions: string[] }> = [
  { keywords: /form|input|field|login|signup|register|contact|survey/i,
    suggestions: ['Add form validation', 'Add submit loading state', 'Add error messages per field', 'Make fields required', 'Add password strength indicator'] },
  { keywords: /table|grid|list|data|row|column|spreadsheet/i,
    suggestions: ['Add sorting by column', 'Add pagination', 'Add row selection', 'Add search/filter bar', 'Add empty state'] },
  { keywords: /card|tile|product|item|post|article/i,
    suggestions: ['Add hover animation', 'Add skeleton loading', 'Make it a horizontal layout', 'Add a badge/tag', 'Add image support'] },
  { keywords: /nav|menu|header|sidebar|drawer|tab/i,
    suggestions: ['Add mobile hamburger menu', 'Add active state highlight', 'Add dropdown submenu', 'Make it sticky', 'Add search bar'] },
  { keywords: /modal|dialog|popup|overlay|alert|toast/i,
    suggestions: ['Add backdrop blur', 'Add close on Escape key', 'Add slide-in animation', 'Add confirmation step', 'Stack multiple toasts'] },
  { keywords: /chart|graph|stat|metric|dashboard|analytics|report/i,
    suggestions: ['Add date range filter', 'Add tooltip on hover', 'Switch to bar chart', 'Add trend comparison', 'Add export button'] },
  { keywords: /button|cta|action|submit|link/i,
    suggestions: ['Add loading spinner on click', 'Add icon variant', 'Add destructive/danger style', 'Add disabled state', 'Add ripple effect'] },
  { keywords: /profile|avatar|user|account|settings/i,
    suggestions: ['Add editable fields', 'Add avatar upload', 'Add activity timeline', 'Add notification preferences', 'Add delete account'] },
  { keywords: /price|pricing|plan|subscription|tier/i,
    suggestions: ['Add monthly/yearly toggle', 'Highlight recommended plan', 'Add feature comparison table', 'Add currency selector', 'Add trial badge'] },
];

const FALLBACK = [
  'Make it dark mode', 'Add loading state', 'Make it responsive',
  'Add hover animations', 'Add error state', 'Make it accessible',
  'Add keyboard navigation', 'Add unit tests', 'Refactor with useReducer',
];

function pickSuggestions(component: ParsedComponent | null): string[] {
  if (!component) return FALLBACK.slice(0, 3);
  const haystack = `${component.componentName} ${component.description ?? ''}`;
  for (const { keywords, suggestions } of CONTEXTUAL) {
    if (keywords.test(haystack)) {
      // Return 3 suggestions, shuffled for variety
      return [...suggestions].sort(() => Math.random() - 0.5).slice(0, 3);
    }
  }
  return [...FALLBACK].sort(() => Math.random() - 0.5).slice(0, 3);
}

interface MessageListProps {
  messages: AgentMessage[];
  streamBuffer: string;
  isStreaming: boolean;
  error: string | null;
  lastComponent: ParsedComponent | null;
  onSuggestion?: (text: string) => void;
}

function parseDisplayContent(content: string): string {
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return content;
    const parsed = JSON.parse(match[0]);
    if (parsed.description) return `Generated **${parsed.componentName}** — ${parsed.description}`;
    return `Generated **${parsed.componentName}**`;
  } catch {
    return content.length > 200 ? content.slice(0, 200) + '…' : content;
  }
}

export function MessageList({ messages, streamBuffer, isStreaming, error, lastComponent, onSuggestion }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  // Recompute suggestions only when the last component changes, not on every render
  const suggestions = useMemo(() => pickSuggestions(lastComponent), [lastComponent?.componentName]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {messages.length === 0 && !isStreaming && (
        <div style={{ textAlign: 'center', color: '#475569', paddingTop: 48, fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <p>Describe any React component or panel.<br />The agent will build it instantly.</p>
        </div>
      )}

      {messages.map((msg, i) => {
        const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1 && !isStreaming;
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: msg.role === 'user' ? '#6366f1' : '#1e293b',
                color: msg.role === 'user' ? '#fff' : '#cbd5e1',
                fontSize: 13,
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}>
                {msg.role === 'assistant' ? parseDisplayContent(msg.content) : msg.content}
              </div>
            </div>
            {isLastAssistant && onSuggestion && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, paddingLeft: 4 }}>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => onSuggestion(s)} style={{
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: 11,
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#6366f1'; (e.target as HTMLButtonElement).style.color = '#a5b4fc'; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#334155'; (e.target as HTMLButtonElement).style.color = '#64748b'; }}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {isStreaming && (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{
            maxWidth: '85%',
            padding: '8px 12px',
            borderRadius: '12px 12px 12px 2px',
            background: '#1e293b',
            color: '#94a3b8',
            fontSize: 13,
            lineHeight: 1.5,
          }}>
            {streamBuffer ? parseDisplayContent(streamBuffer) : (
              <span style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#6366f1',
                    animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite`,
                    display: 'inline-block',
                  }} />
                ))}
                <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '8px 12px',
          borderRadius: 8,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5',
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
