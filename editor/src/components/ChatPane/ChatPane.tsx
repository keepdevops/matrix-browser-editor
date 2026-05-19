
import { useAgentStore } from '../../store/agentStore';
import { useSessionStore } from '../../store/sessionStore';
import { useAgentStream } from '../../hooks/useAgentStream';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import { StatusBadge } from '../shared/StatusBadge';

export function ChatPane() {
  const { messages, isStreaming, streamBuffer, error, clearMessages } = useAgentStore();
  const { activeTemplate } = useSessionStore();
  const { send } = useAgentStream();

  const handleSend = (prompt: string) => {
    send({ prompt, templateCode: activeTemplate?.code });
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
        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>AGENT CHAT</span>
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
      />

      <PromptInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
