import { useState, useRef, useCallback } from 'react';

export interface Rect { x: number; y: number; w: number; h: number }

interface DragState { startX: number; startY: number; dragging: boolean }

export function useImageCrop(imgRef: React.RefObject<HTMLImageElement | null>) {
  const [selection, setSelection] = useState<Rect | null>(null);
  const drag = useRef<DragState>({ startX: 0, startY: 0, dragging: false });

  const getRelativePos = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const { x, y } = getRelativePos(e);
    drag.current = { startX: x, startY: y, dragging: true };
    setSelection({ x, y, w: 0, h: 0 });
  }, [getRelativePos]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current.dragging) return;
    const { x, y } = getRelativePos(e);
    const { startX, startY } = drag.current;
    setSelection({
      x: Math.min(x, startX),
      y: Math.min(y, startY),
      w: Math.abs(x - startX),
      h: Math.abs(y - startY),
    });
  }, [getRelativePos]);

  const onMouseUp = useCallback(() => {
    drag.current.dragging = false;
    setSelection(prev => (prev && prev.w < 4 && prev.h < 4) ? null : prev);
  }, []);

  const cropToDataUrl = useCallback((): string | null => {
    const img = imgRef.current;
    if (!img || !selection || selection.w < 4 || selection.h < 4) return null;

    const displayW = img.clientWidth;
    const displayH = img.clientHeight;
    const scaleX = img.naturalWidth / displayW;
    const scaleY = img.naturalHeight / displayH;

    const canvas = document.createElement('canvas');
    canvas.width = selection.w * scaleX;
    canvas.height = selection.h * scaleY;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      img,
      selection.x * scaleX, selection.y * scaleY,
      selection.w * scaleX, selection.h * scaleY,
      0, 0, canvas.width, canvas.height,
    );
    return canvas.toDataURL('image/png');
  }, [imgRef, selection]);

  const fullToDataUrl = useCallback((): string | null => {
    const img = imgRef.current;
    if (!img) return null;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  }, [imgRef]);

  const clearSelection = useCallback(() => setSelection(null), []);

  return { selection, onMouseDown, onMouseMove, onMouseUp, cropToDataUrl, fullToDataUrl, clearSelection };
}
