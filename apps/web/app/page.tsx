"use client";

import ContextualToolbar from "@/components/ContextualToolbar";
import { Navbar } from "@/components/Navbar";
import { RemoteCursors } from "@/components/RemoteCursors";
import { StickyLayer } from "@/components/StickyLayer";
import Toolbar from "@/components/Toolbar";
import { useCanvas } from "@/hooks/useCanvas";
import { useDrawing } from "@/hooks/useDrawing";
import { type CursorInfo, type UserInfo, useSocket } from "@/hooks/useSocket";
import { useCursorSync } from "@/hooks/useCursorSync";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { useStickyStore } from "@/store/stickyStore";
import { TOOLS } from "@whiteboard/types/constants/global";
import { TOOL_KEYS } from "@/constants/tools";
import {
  CircleIcon,
  Minus,
  PencilLineIcon,
  RectangleHorizontalIcon,
  StickyNoteIcon,
  TypeIcon,
} from "lucide-react";
import type { TStickyNote } from "@whiteboard/types";

const DEFAULT_STICKY_COLOR = "#fde68a";

export default function Home() {
  const canvasRef = useCanvas();
  const { portal } = useDrawing(
    canvasRef as React.RefObject<HTMLCanvasElement | null>,
  );
  const { undo, redo } = useUndoRedo();
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const setIsEraser = useCanvasStore((state) => state.setIsEraser);
  const activeTool = useCanvasStore((state) => state.activeTool);
  const [cursors, setCursors] = useState<Record<string, CursorInfo>>({});
  const [users, setUsers] = useState<UserInfo[]>([]);

  const { addSticky, moveSticky, editSticky, colorSticky, deleteSticky } =
    useStickyStore();

  const isRemoteUpdateRef = useRef(false);

  const onCursorMove = useCallback((cursor: CursorInfo) => {
    setCursors((prev) => ({ ...prev, [cursor.userId]: cursor }));
  }, []);

  const onUserLeft = useCallback((userId: string) => {
    setCursors((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const onUsersChange = useCallback((u: UserInfo[]) => setUsers(u), []);

  const onStickyAdd = useCallback(
    (note: TStickyNote) => {
      isRemoteUpdateRef.current = true;
      addSticky(note);
      isRemoteUpdateRef.current = false;
    },
    [addSticky],
  );

  const onStickyMove = useCallback(
    ({ id, x, y }: { id: string; x: number; y: number }) => {
      isRemoteUpdateRef.current = true;
      moveSticky(id, x, y);
      isRemoteUpdateRef.current = false;
    },
    [moveSticky],
  );

  const onStickyEdit = useCallback(
    ({ id, text }: { id: string; text: string }) => {
      isRemoteUpdateRef.current = true;
      editSticky(id, text);
      isRemoteUpdateRef.current = false;
    },
    [editSticky],
  );

  const onStickyColor = useCallback(
    ({ id, bgColor }: { id: string; bgColor: string }) => {
      isRemoteUpdateRef.current = true;
      colorSticky(id, bgColor);
      isRemoteUpdateRef.current = false;
    },
    [colorSticky],
  );

  const onStickyDelete = useCallback(
    ({ id }: { id: string }) => {
      isRemoteUpdateRef.current = true;
      deleteSticky(id);
      isRemoteUpdateRef.current = false;
    },
    [deleteSticky],
  );

  const { emitCursor, emitStickyAdd, emitStickyMove, emitStickyEdit, emitStickyColor, emitStickyDelete } =
    useSocket(onCursorMove, onUserLeft, onUsersChange, {
      onStickyAdd,
      onStickyMove,
      onStickyEdit,
      onStickyColor,
      onStickyDelete,
    });

  useCursorSync(
    canvasRef as React.RefObject<HTMLCanvasElement | null>,
    emitCursor,
  );

  const handleStickyMove = useCallback(
    (id: string, x: number, y: number) => {
      moveSticky(id, x, y);
      if (!isRemoteUpdateRef.current) emitStickyMove(id, x, y);
    },
    [moveSticky, emitStickyMove],
  );

  const handleStickyEdit = useCallback(
    (id: string, text: string) => {
      editSticky(id, text);
      if (!isRemoteUpdateRef.current) emitStickyEdit(id, text);
    },
    [editSticky, emitStickyEdit],
  );

  // Emit-only: sends real-time keystrokes to remote users without updating local store
  const handleStickyEmit = useCallback(
    (id: string, text: string) => {
      if (!isRemoteUpdateRef.current) emitStickyEdit(id, text);
    },
    [emitStickyEdit],
  );

  const handleStickyColor = useCallback(
    (id: string, bgColor: string) => {
      colorSticky(id, bgColor);
      if (!isRemoteUpdateRef.current) emitStickyColor(id, bgColor);
    },
    [colorSticky, emitStickyColor],
  );

  const handleStickyDelete = useCallback(
    (id: string) => {
      deleteSticky(id);
      if (!isRemoteUpdateRef.current) emitStickyDelete(id);
    },
    [deleteSticky, emitStickyDelete],
  );

  const handleCanvasClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activeTool !== TOOLS.STICKY) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const note: TStickyNote = {
        id: crypto.randomUUID(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        text: "",
        bgColor: DEFAULT_STICKY_COLOR,
        width: 200,
        height: 160,
      };
      addSticky(note);
      emitStickyAdd(note);
      setActiveTool(TOOLS.PENCIL);
      setIsEraser(false);
    },
    [activeTool, addSticky, emitStickyAdd, setActiveTool, setIsEraser],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      )
        return;

      const isMac =
        /mac/i.test(navigator.userAgent) &&
        !/iphone|ipad/i.test(navigator.userAgent);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
        return;
      }

      const binding = TOOL_KEYS[e.key.toLowerCase()];
      if (binding) {
        setActiveTool(binding.tool);
        setIsEraser(binding.eraser);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setActiveTool, setIsEraser]);

  return (
    <div className="home-page">
      <Navbar users={users} />
      <div className="relative">
        <Toolbar className="fixed top-1/2 left-3 z-10 -translate-y-1/2">
          <Toolbar.Tool
            icon={<PencilLineIcon />}
            tool={TOOLS.PENCIL}
            label="Pen"
            shortcut="P"
          />
          <Toolbar.Tool
            icon={<RectangleHorizontalIcon />}
            tool={TOOLS.RECTANGLE}
            label="Rectangle"
            shortcut="R"
          />
          <Toolbar.Tool
            icon={<CircleIcon />}
            tool={TOOLS.CIRCLE}
            label="Circle"
            shortcut="C"
          />
          <Toolbar.Tool
            icon={<Minus />}
            tool={TOOLS.LINE}
            label="Line"
            shortcut="L"
          />
          <Toolbar.Tool
            icon={<TypeIcon />}
            tool={TOOLS.TEXT}
            label="Text"
            shortcut="T"
          />
          <Toolbar.Tool
            icon={<StickyNoteIcon />}
            tool={TOOLS.STICKY}
            label="Sticky"
            shortcut="S"
          />
          <Toolbar.Separator />
          <Toolbar.UndoRedo />
        </Toolbar>
        <ContextualToolbar className="fixed bottom-3 left-1/2 z-10 -translate-x-1/2" />
        {portal}
        <div style={{ position: "relative" }} onPointerDown={handleCanvasClick}>
          <canvas
            className="bg-[rgba(0,0,0,0.4)]"
            ref={canvasRef}
            id="canvas"
            role="presentation"
          >
            This is a fallback
          </canvas>
          <RemoteCursors cursors={cursors} />
          <StickyLayer
            onMove={handleStickyMove}
            onEdit={handleStickyEdit}
            onEmit={handleStickyEmit}
            onColor={handleStickyColor}
            onDelete={handleStickyDelete}
          />
        </div>
      </div>
    </div>
  );
}
