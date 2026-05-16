"use client";

import { useStickyStore } from "@/store/stickyStore";
import { StickyNote } from "@/components/StickyNote";
import type { TStickyNote } from "@whiteboard/types";

type Props = {
  onMove: (id: string, x: number, y: number) => void;
  onEdit: (id: string, text: string) => void;
  onEmit: (id: string, text: string) => void;
  onColor: (id: string, bgColor: string) => void;
  onDelete: (id: string) => void;
};

export function StickyLayer({ onMove, onEdit, onEmit, onColor, onDelete }: Props) {
  const stickies = useStickyStore((state) => state.stickies);

  return (
    <>
      {stickies.map((note: TStickyNote) => (
        <StickyNote
          key={note.id}
          note={note}
          onMove={onMove}
          onEdit={onEdit}
          onEmit={onEmit}
          onColor={onColor}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
