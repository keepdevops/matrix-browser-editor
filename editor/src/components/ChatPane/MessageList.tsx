import { useEffect, useRef } from 'react';
import type { AgentMessage } from '../../lib/schemas';

interface MessageListProps {
  messages: AgentMessage[];
  streamBuffer: string;
  isStreaming: boolean;
  error: string | null;
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

export function MessageList({ messages, streamBuffer, isStreaming, error }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {messages.length === 0 && !isStreaming && (
        <div style={{ textAlign: 'center', color: '#475569', paddingTop: 48, fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <p>Describe any React component or panel.<br />The agent will build it instantly.</p>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
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
      ))}

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
