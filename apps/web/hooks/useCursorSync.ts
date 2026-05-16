import { useEffect, useRef } from "react";

export function useCursorSync(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  emitCursor: (x: number, y: number) => void,
): void {
  const lastEmitRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastEmitRef.current < 50) return;
      lastEmitRef.current = now;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      emitCursor(x, y);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, [canvasRef, emitCursor]);
}
