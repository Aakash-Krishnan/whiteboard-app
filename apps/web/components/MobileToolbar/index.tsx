"use client";

import { useState } from "react";
import {
  CircleIcon,
  Minus,
  PencilLineIcon,
  RectangleHorizontalIcon,
  StickyNoteIcon,
  TypeIcon,
  Undo2Icon,
  Redo2Icon,
  XIcon,
} from "lucide-react";
import { useCanvasStore } from "@/store/canvasStore";
import { TOOLS } from "@whiteboard/types/constants/global";
import type { TTool } from "@whiteboard/types";
import { historyManager } from "@/history/HistoryManager";

const TOOL_LIST: { icon: React.ReactNode; tool: TTool; label: string }[] = [
  { icon: <PencilLineIcon className="w-5 h-5" />, tool: TOOLS.PENCIL, label: "Pen" },
  { icon: <RectangleHorizontalIcon className="w-5 h-5" />, tool: TOOLS.RECTANGLE, label: "Rect" },
  { icon: <CircleIcon className="w-5 h-5" />, tool: TOOLS.CIRCLE, label: "Circle" },
  { icon: <Minus className="w-5 h-5" />, tool: TOOLS.LINE, label: "Line" },
  { icon: <TypeIcon className="w-5 h-5" />, tool: TOOLS.TEXT, label: "Text" },
  { icon: <StickyNoteIcon className="w-5 h-5" />, tool: TOOLS.STICKY, label: "Sticky" },
];

const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#f472b6", "#ffffff", "#94a3b8", "#1e293b"];

export function MobileToolbar() {
  const [open, setOpen] = useState(false);
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const setIsEraser = useCanvasStore((state) => state.setIsEraser);
  const activeColor = useCanvasStore((state) => state.activeColor);
  const setActiveColor = useCanvasStore((state) => state.setActiveColor);

  const activeToolData = TOOL_LIST.find((t) => t.tool === activeTool) ?? TOOL_LIST[0]!;

  const handleToolSelect = (tool: TTool) => {
    setActiveTool(tool);
    setIsEraser(false);
    setOpen(false);
  };

  return (
    <>
      {/* Bottom sheet overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div className="fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl bg-background border-t border-border p-4 pb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground">Tools</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-muted"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Tool grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {TOOL_LIST.map(({ icon, tool, label }) => (
              <button
                key={tool}
                onClick={() => handleToolSelect(tool)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-colors ${
                  activeTool === tool
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Color row */}
          <div className="flex gap-2 flex-wrap mb-4">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setActiveColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  activeColor === color ? "border-primary scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Undo / Redo */}
          <div className="flex gap-2">
            <button
              onClick={() => historyManager.undo()}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 text-sm"
            >
              <Undo2Icon className="w-4 h-4" /> Undo
            </button>
            <button
              onClick={() => historyManager.redo()}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 text-sm"
            >
              <Redo2Icon className="w-4 h-4" /> Redo
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        title="Tools"
      >
        {activeToolData.icon}
      </button>
    </>
  );
}
