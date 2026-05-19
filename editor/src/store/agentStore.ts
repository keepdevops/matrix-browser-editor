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

function normalizeJson(raw: string): string {
  // Replace backtick template literals used as string values with proper JSON strings
  return raw.replace(/:\s*`([\s\S]*?)`/g, (_match, inner) => {
    const escaped = inner.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
    return `: "${escaped}"`;
  });
}

function parseComponent(text: string): ParsedComponent | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const normalized = normalizeJson(jsonMatch[0]);
    const parsed = JSON.parse(normalized);
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
