import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgentMessage, ParsedComponent } from '../lib/schemas';

export interface AgentPendingEdit {
  oldCode: string;
  newCode: string;
  componentName: string;
  language: string;
}

interface AgentState {
  messages: AgentMessage[];
  isStreaming: boolean;
  streamBuffer: string;
  lastComponent: ParsedComponent | null;
  error: string | null;
  pendingEdit: AgentPendingEdit | null;

  addUserMessage: (content: string) => void;
  startAssistantStream: () => void;
  appendStreamDelta: (delta: string) => void;
  finalizeStream: (fullContent: string) => void;
  setLastComponent: (component: ParsedComponent) => void;
  setError: (error: string) => void;
  clearError: () => void;
  clearMessages: () => void;
  setPendingEdit: (edit: AgentPendingEdit | null) => void;
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

function tryParseJson(raw: string): ParsedComponent | null {
  let src = raw;
  let extractedCode: string | null = null;

  if (/"code"\s*:\s*`/.test(src)) {
    const extracted = extractCodeField(src);
    if (!extracted) return null;
    src = extracted.withoutCode;
    extractedCode = extracted.code;
  }

  try {
    const parsed = JSON.parse(src);
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

// Walk text respecting backtick and double-quoted strings to find top-level JSON objects.
function extractJsonSegments(text: string): string[] {
  const segments: string[] = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf('{', i);
    if (start === -1) break;
    let depth = 0;
    let j = start;
    let inString = false;
    let inBacktick = false;
    while (j < text.length) {
      const ch = text[j];
      if (inBacktick) {
        if (ch === '`') inBacktick = false;
      } else if (inString) {
        if (ch === '\\') j++;
        else if (ch === '"') inString = false;
      } else {
        if (ch === '`') inBacktick = true;
        else if (ch === '"') inString = true;
        else if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) break; }
      }
      j++;
    }
    if (depth === 0) {
      segments.push(text.slice(start, j + 1));
      i = j + 1;
    } else {
      break;
    }
  }
  return segments;
}

// Swarm concatenates one JSON blob per agent — pick the one with the most actual code.
function parseComponent(text: string): ParsedComponent | null {
  const candidates: ParsedComponent[] = [];

  // Strategy 1: direct JSON.parse (server sends clean JSON)
  const direct = tryParseJson(text.trim());
  if (direct) candidates.push(direct);

  // Strategy 2: greedy {…} extraction (handles leading/trailing text or markdown)
  const greedyMatch = text.match(/\{[\s\S]*\}/);
  if (greedyMatch) {
    const result = tryParseJson(greedyMatch[0]);
    if (result) candidates.push(result);
  }

  // Strategy 3: fenced JSON/code blocks (``` json {...} ```)
  const fenceRe = /```(?:json|tsx?|jsx?|typescript|javascript)?\s*\n([\s\S]*?)```/g;
  let fm: RegExpExecArray | null;
  while ((fm = fenceRe.exec(text)) !== null) {
    const result = tryParseJson(fm[1].trim());
    if (result) candidates.push(result);
  }

  // Strategy 4: walker-based multi-object extraction (swarm multi-agent blobs)
  for (const seg of extractJsonSegments(text)) {
    const result = tryParseJson(seg);
    if (result) candidates.push(result);
  }

  if (candidates.length === 0) {
    console.error('[agentStore] parseComponent failed. Text preview:', text.slice(0, 400));
    return null;
  }
  return candidates.reduce((best, c) => c.code.length > best.code.length ? c : best);
}

export const useAgentStore = create<AgentState>()(persist((set, get) => ({
  messages: [],
  isStreaming: false,
  streamBuffer: '',
  lastComponent: null,
  error: null,
  pendingEdit: null,

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

  setPendingEdit: (edit) => set({ pendingEdit: edit }),
}), {
  name: 'agent-store',
  partialize: (s) => ({ messages: s.messages, lastComponent: s.lastComponent }),
}));
