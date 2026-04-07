import { useEffect, useRef } from "react";
import { TPoint, TStroke } from "@whiteboard/types";

type TUseDrawingReturn = {
  lastX: React.RefObject<number>;
  lastY: React.RefObject<number>;
};

function getRect(canvas: HTMLCanvasElement, e: MouseEvent): TPoint {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  return { x, y };
}

function reDraw(ctx: CanvasRenderingContext2D | null, strokes: TStroke[]) {
  if (!ctx) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  strokes.forEach((stroke) => {
    const { path } = stroke;
    if (stroke?.color) {
      ctx.strokeStyle = stroke.color;
    } else {
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    }
    path.forEach((point, idx) => {
      const { x, y } = point;
      if (idx === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  });
}

export function useDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
): TUseDrawingReturn {
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const strokes = useRef<TStroke[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Start drawing
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const { x, y } = getRect(canvas, e);
      lastX.current = x;
      lastY.current = y;

      strokes.current.push({ path: [{ x, y }] });

      reDraw(ctx, strokes.current);
    };

    // Stop drawing
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();

      isDrawing.current = false;
    };

    let rafId: number;
    // Move drawing
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;

      const { x, y } = getRect(canvas, e);
      lastX.current = x;
      lastY.current = y;

      strokes.current[strokes.current.length - 1]?.path.push({ x, y });

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => reDraw(ctx, strokes.current));
    };

    // Leave drawing + Stop drawing
    const handleMouseLeave = (e: MouseEvent) => {
      e.preventDefault();

      isDrawing.current = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [canvasRef]);

  return { lastX, lastY };
}
