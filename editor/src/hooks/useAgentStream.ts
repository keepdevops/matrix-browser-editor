import { useCallback } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface StreamOptions {
  prompt: string;
  templateCode?: string;
}

export function useAgentStream() {
  const { addUserMessage, startAssistantStream, appendStreamDelta, finalizeStream, setError, messages } = useAgentStore();
  const { setCode, setComponentName, setLanguage } = useEditorStore();
  const { styleSystem, theme } = useSessionStore();

  const send = useCallback(async ({ prompt, templateCode }: StreamOptions) => {
    addUserMessage(prompt);
    startAssistantStream();

    const history = messages
      .filter((m) => !m.isStreaming)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(`${SERVER}/api/agent/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, styleSystem, theme, templateCode, history }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'delta') {
              fullContent += event.content;
              appendStreamDelta(event.content);
            } else if (event.type === 'done') {
              finalizeStream(fullContent || event.content);
              const component = useAgentStore.getState().lastComponent;
              if (component) {
                setCode(component.code);
                setComponentName(component.componentName);
                setLanguage(component.language as 'tsx' | 'jsx' | 'ts' | 'js');
              }
              return;
            } else if (event.type === 'error') {
              throw new Error(event.content);
            }
          } catch (parseErr) {
            console.error('[useAgentStream] parse error:', parseErr);
          }
        }
      }

      finalizeStream(fullContent);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useAgentStream] error:', message);
      setError(message);
    }
  }, [addUserMessage, startAssistantStream, appendStreamDelta, finalizeStream, setError, setCode, setComponentName, setLanguage, styleSystem, theme, messages]);

  return { send };
}
