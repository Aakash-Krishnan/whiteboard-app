import type { TStroke } from "@whiteboard/types";
import type { DrawContext, ElementRenderer, ToolDefinition, ToolHandler } from "../drawing/types";

const handler: ToolHandler = {
  onDown: (point, { addElement, getState }) => {
    const { activeColor, activeThickness, isEraser, activeTool } = getState();
    const stroke: TStroke = {
      path: [point],
      color: activeColor,
      tool: activeTool as TStroke["tool"],
      thickness: activeThickness,
      isEraser,
    };
    addElement(stroke);
  },
  onMove: (point, { addPoint }: DrawContext) => {
    addPoint(point);
  },
};

const renderer: ElementRenderer = (ctx, el) => {
  const stroke = el as TStroke;
  ctx.globalCompositeOperation = stroke.isEraser
    ? "destination-out"
    : "source-over";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  stroke.path.forEach((point, idx) => {
    const { x, y } = point;
    if (idx === 0) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (idx < stroke.path.length - 1) {
      const next = stroke.path[idx + 1]!;
      const m2 = { x: (next.x + x) / 2, y: (next.y + y) / 2 };
      ctx.quadraticCurveTo(x, y, m2.x, m2.y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
};

export function usePencilTool(): ToolDefinition {
  return { handler, renderer };
}
