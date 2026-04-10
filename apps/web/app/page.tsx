"use client";

import Toolbar from "@/components/Toolbar";
import { useCanvas } from "@/hooks/useCanvas";
import { useDrawing } from "@/hooks/useDrawing";
import { TOOLS } from "@whiteboard/types/constants/global";
import { EraserIcon, PenIcon } from "lucide-react";

export default function Home() {
  const canvasRef = useCanvas();
  useDrawing(canvasRef as React.RefObject<HTMLCanvasElement | null>);

  return (
    <div className="home-page relative">
      <Toolbar>
        <Toolbar.ColorPicker />
        <Toolbar.Separator />
        <Toolbar.Tool icon={<PenIcon />} tool={TOOLS.PENCIL} label="Pen" />
        <Toolbar.Tool
          icon={<EraserIcon />}
          tool={TOOLS.ERASER}
          label="Eraser"
        />
      </Toolbar>
      <canvas
        className="bg-[rgba(0,0,0,0.4)]"
        ref={canvasRef}
        id="canvas"
        role="presentation"
      >
        This is a fallback
      </canvas>
    </div>
  );
}
