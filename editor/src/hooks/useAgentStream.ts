import { useCallback } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';
import { useFileTabStore } from '../store/fileTabStore';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface StreamOptions {
  prompt: string;
  templateCode?: string;
  screenshotImage?: string;
}

export function useAgentStream() {
  const { addUserMessage, startAssistantStream, appendStreamDelta, finalizeStream, setError, messages } = useAgentStore();
  const { setCode, setComponentName, setLanguage } = useEditorStore();
  const { styleSystem, theme } = useSessionStore();
  const { openTab, tabs, activeTabId, setActiveTab } = useFileTabStore();

  const send = useCallback(async ({ prompt, templateCode, screenshotImage }: StreamOptions) => {
    addUserMessage(prompt);
    startAssistantStream();

    const history = messages
      .filter((m) => !m.isStreaming)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    // Strip data-URL prefix — server expects raw base64
    const imageBase64 = screenshotImage?.replace(/^data:image\/[^;]+;base64,/, '');

    try {
      const response = await fetch(`${SERVER}/api/agent/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, styleSystem, theme, templateCode, history, screenshotImage: imageBase64 }),
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
              // event.content holds the canonical JSON from the server;
              // fullContent is the raw markdown stream used only for display
              finalizeStream(event.content || fullContent);
              const component = useAgentStore.getState().lastComponent;
              if (component) {
                setCode(component.code);
                setComponentName(component.componentName);
                setLanguage(component.language as 'tsx' | 'jsx' | 'ts' | 'js');
                // Update active tab or open a new one if name differs
                const activeTab = tabs.find(t => t.id === activeTabId);
                if (activeTab && activeTab.name === component.componentName) {
                  // already on the right tab — code syncs via updateActiveCode in CodePane
                } else {
                  const existing = tabs.find(t => t.name === component.componentName);
                  if (existing) { setActiveTab(existing.id); }
                  else { openTab({ name: component.componentName, code: component.code, language: component.language as 'tsx' | 'jsx' | 'ts' | 'js' }); }
                }
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
