"use client";

import { useCanvas } from "@/hooks/useCanvas";
import { useEffect } from "react";

export default function Home() {
  const canvasRef = useCanvas();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Rectangle
    ctx.fillStyle = "steelblue";
    ctx.fillRect(50.5, 50.5, 200, 100);

    // Line
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(250, 200);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Text
    ctx.fillStyle = "black";
    ctx.font = "24px sans-serif";
    ctx.fillText("Hello Canvas", 50, 280);

    // Circle
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI * 2, false);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
  }, [canvasRef]);

  return (
    <div className="home-page">
      <canvas
        ref={canvasRef}
        id="canvas"
        role="presentation"
        style={{ border: "1px solid #000" }}
      >
        This is a fallback
      </canvas>
    </div>
  );
}
