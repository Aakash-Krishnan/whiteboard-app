import type { TElement, TPoint } from "@whiteboard/types";
import type { useCanvasStore } from "@/store/canvasStore";

export type DrawContext = {
  getState: typeof useCanvasStore.getState;
  addElement: (el: TElement) => void;
  updateLastElement: (updater: (el: TElement) => TElement) => void;
  addPoint: (point: TPoint) => void;
  origin: TPoint;
  commitElement: (element: TElement) => void;
};

export type ToolHandler = {
  onDown: (point: TPoint, ctx: DrawContext) => void;
  onMove: (point: TPoint, ctx: DrawContext) => void;
  onUp?: (ctx: DrawContext) => void;
};

export type ElementRenderer = (
  ctx: CanvasRenderingContext2D,
  el: TElement,
) => void;

export type ToolDefinition = {
  handler: ToolHandler;
  renderer: ElementRenderer;
};
