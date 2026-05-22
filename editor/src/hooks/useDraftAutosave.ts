import { useEffect, useRef, useState } from 'react';

const DRAFT_KEY = 'editor-draft';
const DEBOUNCE_MS = 2000;
const SESSION_START = Date.now();

export interface Draft {
  code: string;
  componentName: string;
  language: string;
  savedAt: number;
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    if (!d.code || !d.savedAt) return null;
    return d;
  } catch {
    return null;
  }
}

function writeDraft(draft: Omit<Draft, 'savedAt'>) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch (e) {
    console.error('[useDraftAutosave] write failed:', e);
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function useDraftAutosave(code: string, componentName: string, language: string) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);

  // On mount: check for a draft saved before this session started
  useEffect(() => {
    const draft = readDraft();
    if (draft && draft.savedAt < SESSION_START && draft.code.trim()) {
      setPendingDraft(draft);
    }
  }, []);

  // Debounced auto-save on code change
  useEffect(() => {
    if (!code.trim()) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      writeDraft({ code, componentName, language });
    }, DEBOUNCE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [code, componentName, language]);

  const dismissDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  return { pendingDraft, dismissDraft };
}
