"use client";

import { Undo2, Redo2 } from "lucide-react";
import { useUndoRedo } from "@/hooks/useUndoRedo";

export function UndoRedo() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Undo2 size={18} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Redo2 size={18} />
      </button>
    </div>
  );
}
