import { useEffect, useRef } from "react";

/**
 * NOTE: Manages a full-viewport canvas element with HiDPI (High Dots Per Inch / devicePixelRatio) support.
 * Automatically resizes the canvas on window resize and scales the 2D context
 * so drawing coordinates remain in CSS pixels.
 *
 * @returns A ref to attach to a `<canvas>` element.
 */
export function useCanvas(): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio;
      canvas.height = window.innerHeight * dpr;
      canvas.width = window.innerWidth * dpr;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return canvasRef;
}
