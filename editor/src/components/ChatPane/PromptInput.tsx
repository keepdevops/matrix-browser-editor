import { useState, useRef, type KeyboardEvent } from 'react';

interface PromptInputProps {
  onSend: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptInput({ onSend, disabled }: PromptInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        background: '#1e293b',
        borderRadius: 10,
        padding: '8px 12px',
        border: '1px solid #334155',
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); handleInput(); }}
          onKeyDown={handleKey}
          placeholder="Describe a component… (Enter to send, Shift+Enter for newline)"
          rows={1}
          disabled={disabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            color: '#f1f5f9',
            fontSize: 14,
            lineHeight: '1.5',
            fontFamily: 'inherit',
            minHeight: 24,
          }}
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            background: disabled || !value.trim() ? '#334155' : '#6366f1',
            color: disabled || !value.trim() ? '#64748b' : '#fff',
            border: 'none',
            cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
