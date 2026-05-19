import { create } from 'zustand';
import type { AgentMessage, ParsedComponent } from '../lib/schemas';

interface AgentState {
  messages: AgentMessage[];
  isStreaming: boolean;
  streamBuffer: string;
  lastComponent: ParsedComponent | null;
  error: string | null;

  addUserMessage: (content: string) => void;
  startAssistantStream: () => void;
  appendStreamDelta: (delta: string) => void;
  finalizeStream: (fullContent: string) => void;
  setLastComponent: (component: ParsedComponent) => void;
  setError: (error: string) => void;
  clearError: () => void;
  clearMessages: () => void;
}

function extractCodeField(raw: string): { withoutCode: string; code: string } | null {
  // Match "code": `...` where the backtick block may contain nested backticks
  // Strategy: find `"code":` then grab everything between the first ` and the last ` before `\n}`
  const codeKeyIdx = raw.search(/"code"\s*:\s*`/);
  if (codeKeyIdx === -1) return null;
  const openTick = raw.indexOf('`', codeKeyIdx);
  if (openTick === -1) return null;
  // Find the closing backtick: last ` before the closing `\n}` of the object
  const closeTick = raw.lastIndexOf('`');
  if (closeTick <= openTick) return null;
  const code = raw.slice(openTick + 1, closeTick);
  const withoutCode = raw.slice(0, codeKeyIdx) + '"code": "__CODE__"' + raw.slice(closeTick + 1);
  return { withoutCode, code };
}

function parseComponent(text: string): ParsedComponent | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    let raw = jsonMatch[0];
    let extractedCode: string | null = null;

    // Handle backtick-delimited code field from swarm responses
    if (/"code"\s*:\s*`/.test(raw)) {
      const extracted = extractCodeField(raw);
      if (!extracted) return null;
      raw = extracted.withoutCode;
      extractedCode = extracted.code;
    }

    const parsed = JSON.parse(raw);
    if (extractedCode !== null) parsed.code = extractedCode;
    if (!parsed.code || !parsed.componentName) return null;
    return {
      componentName: parsed.componentName,
      language: parsed.language || 'tsx',
      description: parsed.description,
      dependencies: parsed.dependencies || [],
      code: parsed.code,
    };
  } catch {
    return null;
  }
}

export const useAgentStore = create<AgentState>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamBuffer: '',
  lastComponent: null,
  error: null,

  addUserMessage: (content) => set((s) => ({
    messages: [...s.messages, { role: 'user', content, timestamp: Date.now() }],
    error: null,
  })),

  startAssistantStream: () => set({
    isStreaming: true,
    streamBuffer: '',
  }),

  appendStreamDelta: (delta) => set((s) => ({
    streamBuffer: s.streamBuffer + delta,
  })),

  finalizeStream: (fullContent) => {
    const component = parseComponent(fullContent);
    const message: AgentMessage = {
      role: 'assistant',
      content: fullContent,
      timestamp: Date.now(),
      isStreaming: false,
    };
    set((s) => ({
      messages: [...s.messages, message],
      isStreaming: false,
      streamBuffer: '',
      lastComponent: component ?? s.lastComponent,
      error: component ? null : 'Could not parse component from response',
    }));
    if (component) {
      get().setLastComponent(component);
    }
  },

  setLastComponent: (component) => set({ lastComponent: component }),

  setError: (error) => set({ error, isStreaming: false }),

  clearError: () => set({ error: null }),

  clearMessages: () => set({ messages: [], lastComponent: null, error: null }),
}));
