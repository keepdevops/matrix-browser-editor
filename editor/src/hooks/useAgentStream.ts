import { useCallback } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';
import { useFileTabStore } from '../store/fileTabStore';
import { useHistoryStore } from '../store/historyStore';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface StreamOptions {
  prompt: string;
  templateCode?: string;
  screenshotImage?: string;
}

export function useAgentStream() {
  const { addUserMessage, startAssistantStream, appendStreamDelta, finalizeStream, setError, messages, pendingEdit: pending, setPendingEdit: setPending } = useAgentStore();
  const { code: currentCode, setCode, setComponentName, setLanguage } = useEditorStore();
  const { styleSystem, theme, setRightTab } = useSessionStore();
  const { openTab, tabs, activeTabId, setActiveTab } = useFileTabStore();
  const { push: pushHistory } = useHistoryStore();

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
                setPending({
                  oldCode: useEditorStore.getState().code,
                  newCode: component.code,
                  componentName: component.componentName,
                  language: component.language,
                });
                setRightTab('code');
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
  }, [addUserMessage, startAssistantStream, appendStreamDelta, finalizeStream, setError, setCode, setComponentName, setLanguage, setRightTab, styleSystem, theme, messages, setPending]);

  const confirmPending = useCallback(() => {
    if (!pending) return;
    pushHistory({ code: pending.newCode, componentName: pending.componentName, language: pending.language, timestamp: Date.now(), source: 'ai' });
    setCode(pending.newCode);
    setComponentName(pending.componentName);
    setLanguage(pending.language as 'tsx' | 'jsx' | 'ts' | 'js');
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && activeTab.name === pending.componentName) {
      // already on right tab
    } else {
      const existing = tabs.find(t => t.name === pending.componentName);
      if (existing) { setActiveTab(existing.id); }
      else { openTab({ name: pending.componentName, code: pending.newCode, language: pending.language as 'tsx' | 'jsx' | 'ts' | 'js' }); }
    }
    setPending(null);
  }, [pending, pushHistory, setCode, setComponentName, setLanguage, tabs, activeTabId, setActiveTab, openTab, setPending]);

  const rejectPending = useCallback(() => setPending(null), [setPending]);

  return { send, pending, confirmPending, rejectPending };
}
