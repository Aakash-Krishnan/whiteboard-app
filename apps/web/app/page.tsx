"use client";

import ContextualToolbar from "@/components/ContextualToolbar";
import { Navbar } from "@/components/Navbar";
import { RemoteCursors } from "@/components/RemoteCursors";
import Toolbar from "@/components/Toolbar";
import { useCanvas } from "@/hooks/useCanvas";
import { useDrawing } from "@/hooks/useDrawing";
import { type CursorInfo, type UserInfo, useSocket } from "@/hooks/useSocket";
import { useCursorSync } from "@/hooks/useCursorSync";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useCallback, useEffect, useState } from "react";
import { TOOLS } from "@whiteboard/types/constants/global";
import {
  CircleIcon,
  Minus,
  PencilLineIcon,
  RectangleHorizontalIcon,
  TypeIcon,
} from "lucide-react";

export default function Home() {
  const canvasRef = useCanvas();
  const { portal } = useDrawing(canvasRef as React.RefObject<HTMLCanvasElement | null>);
  const { undo, redo } = useUndoRedo();
  const [cursors, setCursors] = useState<Record<string, CursorInfo>>({});
  const [users, setUsers] = useState<UserInfo[]>([]);

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

  const { emitCursor } = useSocket(onCursorMove, onUserLeft, onUsersChange);
  useCursorSync(canvasRef as React.RefObject<HTMLCanvasElement | null>, emitCursor);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /mac/i.test(navigator.userAgent) && !/iphone|ipad/i.test(navigator.userAgent);
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (!modKey) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="home-page">
      <Navbar users={users} />
      <div className="relative">
        <Toolbar className="fixed top-1/2 left-3 z-10 -translate-y-1/2">
          <Toolbar.Tool
            icon={<PencilLineIcon />}
            tool={TOOLS.PENCIL}
            label="Pen"
          />
          <Toolbar.Tool
            icon={<RectangleHorizontalIcon />}
            tool={TOOLS.RECTANGLE}
            label="Rectangle"
          />
          <Toolbar.Tool
            icon={<CircleIcon />}
            tool={TOOLS.CIRCLE}
            label="Circle"
          />
          <Toolbar.Tool icon={<Minus />} tool={TOOLS.LINE} label="Line" />
          <Toolbar.Tool icon={<TypeIcon />} tool={TOOLS.TEXT} label="Text" />
          <Toolbar.Separator />
          <Toolbar.UndoRedo />
        </Toolbar>
        <ContextualToolbar className="fixed bottom-3 left-1/2 z-10 -translate-x-1/2" />
        {portal}
        <div style={{ position: "relative" }}>
          <canvas
            className="bg-[rgba(0,0,0,0.4)]"
            ref={canvasRef}
            id="canvas"
            role="presentation"
          >
            This is a fallback
          </canvas>
          <RemoteCursors cursors={cursors} />
        </div>
      </div>
    </div>
  );
}
