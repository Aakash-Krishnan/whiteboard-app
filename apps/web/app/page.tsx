"use client";

import { useCanvas } from "@/hooks/useCanvas";
import { useDrawing } from "@/hooks/useDrawing";

export default function Home() {
  const canvasRef = useCanvas();
  useDrawing(canvasRef as React.RefObject<HTMLCanvasElement | null>);

  return (
    <div className="home-page">
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
