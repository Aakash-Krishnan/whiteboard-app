import type { TElement } from "@whiteboard/types";
import type { ElementRenderer } from "./types";

export function drawElement(
  ctx: CanvasRenderingContext2D,
  element: TElement,
  renderers: Partial<Record<string, ElementRenderer>>,
) {
  ctx.strokeStyle = element.color ?? "rgba(0,0,0,1)";
  ctx.lineWidth = element.thickness;
  renderers[element.tool]?.(ctx, element);
}

export function reDraw(
  ctx: CanvasRenderingContext2D | null,
  elements: TElement[],
  renderers: Partial<Record<string, ElementRenderer>>,
) {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  elements.forEach((el) => drawElement(ctx, el, renderers));
}
