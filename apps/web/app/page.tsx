"use client";

import ContextualToolbar from "@/components/ContextualToolbar";
import Toolbar from "@/components/Toolbar";
import { useCanvas } from "@/hooks/useCanvas";
import { useDrawing } from "@/hooks/useDrawing";
import { TOOLS } from "@whiteboard/types/constants/global";
import { PenIcon, RectangleHorizontalIcon } from "lucide-react";

export default function Home() {
  const canvasRef = useCanvas();
  useDrawing(canvasRef as React.RefObject<HTMLCanvasElement | null>);

  return (
    <div className="home-page">
      <div className="relative">
        <Toolbar className="fixed top-1/2 left-3 z-10 -translate-y-1/2">
          <Toolbar.Tool icon={<PenIcon />} tool={TOOLS.PENCIL} label="Pen" />
          <Toolbar.Tool
            icon={<RectangleHorizontalIcon />}
            tool={TOOLS.RECTANGLE}
            label="Rectangle"
          />
        </Toolbar>
        <ContextualToolbar className="fixed bottom-3 left-1/2 z-10 -translate-x-1/2" />
        <canvas
          className="bg-[rgba(0,0,0,0.4)]"
          ref={canvasRef}
          id="canvas"
          role="presentation"
        >
          This is a fallback
        </canvas>
      </div>
    </div>
  );
}
