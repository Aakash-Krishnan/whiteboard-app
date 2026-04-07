"use client";

import { useCanvas } from "@/hooks/useCanvas";
import { useDrawing } from "@/hooks/useDrawing";

export default function Home() {
  const canvasRef = useCanvas();
  useDrawing(canvasRef as React.RefObject<HTMLCanvasElement | null>);

  return (
    <div className="home-page">
      <canvas ref={canvasRef} id="canvas" role="presentation">
        This is a fallback
      </canvas>
    </div>
  );
}
