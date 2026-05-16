"use client";

import { useEffect, useRef } from "react";
import type { TStickyNote } from "@whiteboard/types";

const COLORS = ["#fde68a", "#6ee7b7", "#93c5fd", "#f9a8d4"] as const;

type Props = {
  note: TStickyNote;
  onMove: (id: string, x: number, y: number) => void;
  onEdit: (id: string, text: string) => void;
  onEmit: (id: string, text: string) => void;
  onColor: (id: string, bgColor: string) => void;
  onDelete: (id: string) => void;
};

export function StickyNote({ note, onMove, onEdit, onEmit, onColor, onDelete }: Props) {
  const dragRef = useRef<{ isDragging: boolean; offsetX: number; offsetY: number }>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  });
  const nodeRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Set initial text content via DOM — never let React control this div's children
  useEffect(() => {
    if (bodyRef.current && bodyRef.current.innerText !== note.text) {
      bodyRef.current.innerText = note.text;
    }
  }, [note.text]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      isDragging: true,
      offsetX: e.clientX - note.x,
      offsetY: e.clientY - note.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging || !nodeRef.current) return;
    const x = e.clientX - dragRef.current.offsetX;
    const y = e.clientY - dragRef.current.offsetY;
    nodeRef.current.style.left = `${x}px`;
    nodeRef.current.style.top = `${y}px`;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    const x = e.clientX - dragRef.current.offsetX;
    const y = e.clientY - dragRef.current.offsetY;
    onMove(note.id, x, y);
  };

  return (
    <div
      ref={nodeRef}
      className="absolute rounded-lg shadow-lg select-none"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        background: note.bgColor,
        zIndex: 20,
        cursor: "grab",
        pointerEvents: "auto",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 rounded-t-lg bg-black/10">
        <div className="flex gap-1" data-no-drag>
          {COLORS.map((color) => (
            <button
              key={color}
              className="w-3 h-3 rounded-full border border-black/10 hover:scale-110 transition-transform"
              style={{ background: color }}
              onClick={() => onColor(note.id, color)}
            />
          ))}
        </div>
        <button
          className="text-xs text-black/40 hover:text-black/80 leading-none"
          data-no-drag
          onClick={() => onDelete(note.id)}
        >
          ✕
        </button>
      </div>

      {/* Body — uncontrolled, content managed via ref */}
      <div
        ref={bodyRef}
        className="p-2 text-sm text-gray-800 outline-none w-full overflow-y-auto"
        style={{ cursor: "text", height: "calc(100% - 28px)", wordBreak: "break-word", whiteSpace: "pre-wrap" }}
        contentEditable
        suppressContentEditableWarning
        data-no-drag
        onInput={(e) => onEmit(note.id, (e.currentTarget as HTMLDivElement).innerText)}
        onBlur={(e) => onEdit(note.id, e.currentTarget.innerText)}
      />
    </div>
  );
}
