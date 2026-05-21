import { useEffect, useState } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { useSessionStore } from '../../store/sessionStore';
import { useAgentStream } from '../../hooks/useAgentStream';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import { StatusBadge } from '../shared/StatusBadge';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function ChatPane() {
  const { messages, isStreaming, streamBuffer, error, clearMessages } = useAgentStore();
  const { activeTemplate, pendingScreenshot, setPendingScreenshot } = useSessionStore();
  const { send } = useAgentStream();
  const [swarmEnabled, setSwarmEnabled] = useState(false);

  useEffect(() => {
    fetch(`${SERVER}/api/status`)
      .then((r) => r.json())
      .then((d) => setSwarmEnabled(d.swarmEnabled))
      .catch(() => {});
  }, []);

  const handleSend = (prompt: string, image?: string | null) => {
    send({ prompt, templateCode: activeTemplate?.code, screenshotImage: image ?? undefined });
  };

  const status = isStreaming ? 'loading' : error ? 'error' : 'idle';
  const statusMsg = isStreaming ? 'Generating…' : error ? 'Error' : `${messages.length} messages`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>AGENT CHAT</span>
          {swarmEnabled && (
            <span title="Multi-agent swarm active" style={{
              fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
              background: 'rgba(99,102,241,0.15)', border: '1px solid #4f46e5', color: '#a5b4fc',
            }}>⚡ SWARM</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge status={status} message={statusMsg} />
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <MessageList
        messages={messages}
        streamBuffer={streamBuffer}
        isStreaming={isStreaming}
        error={error}
        onSuggestion={(text) => handleSend(text)}
      />

      <PromptInput
        onSend={handleSend}
        disabled={isStreaming}
        attachedImage={pendingScreenshot}
        onImageAttach={setPendingScreenshot}
        onClearImage={() => setPendingScreenshot(null)}
      />
    </div>
  );
}
