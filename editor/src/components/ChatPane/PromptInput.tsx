import { useState, useRef, useEffect, type KeyboardEvent, type DragEvent, type ClipboardEvent } from 'react';
import { ImageEditorModal } from '../ImageEditor/ImageEditorModal';

type PasteEvent = globalThis.ClipboardEvent;

interface PromptInputProps {
  onSend: (prompt: string, image?: string | null) => void;
  disabled?: boolean;
  attachedImage?: string | null;
  onImageAttach?: (dataUrl: string) => void;
  onClearImage?: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => { console.error('[PromptInput] FileReader error:', reader.error); reject(reader.error); };
    reader.readAsDataURL(file);
  });
}

export function PromptInput({ onSend, disabled, attachedImage, onImageAttach, onClearImage }: PromptInputProps) {
  const [value, setValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (attachedImage) textareaRef.current?.focus();
  }, [attachedImage]);

  // Global paste listener: catches Ctrl+V even when textarea isn't focused
  useEffect(() => {
    const handleGlobalPaste = (e: PasteEvent) => {
      // Don't intercept if user is typing in an input/textarea (let text paste normally)
      const target = e.target as HTMLElement;
      const isTextInput = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find(i => i.type.startsWith('image/'));
      if (!imageItem) return;
      // Has an image — always intercept
      if (!isTextInput) e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) handleImageFile(file);
    };
    document.addEventListener('paste', handleGlobalPaste as EventListener);
    return () => document.removeEventListener('paste', handleGlobalPaste as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onImageAttach]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, attachedImage);
    setValue('');
    onClearImage?.();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onImageAttach?.(dataUrl);
    } catch (err) {
      console.error('[PromptInput] failed to read image file:', err);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(i => i.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) handleImageFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) handleImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
    {editorOpen && attachedImage && (
      <ImageEditorModal
        src={attachedImage}
        onClose={() => setEditorOpen(false)}
        onUseInPrompt={(dataUrl) => { onImageAttach?.(dataUrl); setEditorOpen(false); }}
      />
    )}
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', background: '#0f172a' }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: isDragOver ? '#1a1f35' : '#1e293b',
        borderRadius: 10,
        padding: '8px 12px',
        border: isDragOver ? '1.5px dashed #6366f1' : '1px solid #334155',
        transition: 'border 0.15s, background 0.15s',
      }}>
        {attachedImage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4, borderBottom: '1px solid #334155' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={attachedImage}
                alt="Attached"
                onClick={() => setEditorOpen(true)}
                title="Click to open image editor"
                style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #475569', cursor: 'pointer' }}
              />
              <button
                onClick={onClearImage}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#475569', border: 'none', color: '#f1f5f9',
                  cursor: 'pointer', fontSize: 10, lineHeight: '18px', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>Image attached — describe what to change or build</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="Attach image"
            style={{
              flexShrink: 0, padding: '4px 6px', borderRadius: 6,
              background: 'transparent', border: '1px solid #334155',
              color: '#64748b', cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 14, lineHeight: 1,
            }}
          >
            📎
          </button>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); handleInput(); }}
            onKeyDown={handleKey}
            onPaste={handlePaste}
            placeholder={attachedImage ? 'Describe what to build or change…' : 'Describe a component… or paste / drop an image (Enter to send)'}
            rows={1}
            disabled={disabled}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', color: '#f1f5f9', fontSize: 14, lineHeight: '1.5',
              fontFamily: 'inherit', minHeight: 24,
            }}
          />
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            style={{
              padding: '6px 16px', borderRadius: 6,
              background: disabled || !value.trim() ? '#334155' : '#6366f1',
              color: disabled || !value.trim() ? '#64748b' : '#fff',
              border: 'none', cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'background 0.15s', whiteSpace: 'nowrap',
            }}
          >
            Send
          </button>
        </div>

        {isDragOver && (
          <div style={{ textAlign: 'center', fontSize: 11, color: '#6366f1', paddingBottom: 2 }}>
            Drop image here
          </div>
        )}
      </div>
    </div>
    </>
  );
}
