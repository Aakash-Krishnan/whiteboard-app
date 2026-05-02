import type { TEllipse } from "@whiteboard/types";
import { FILL_MODES } from "@whiteboard/types/constants/global";
import type { ElementRenderer, ToolDefinition, ToolHandler } from "../drawing/types";
import { historyManager } from "@/history/HistoryManager";
import { CommitLastElementCommand } from "@/history/commands/CommitLastElementCommand";

const handler: ToolHandler = {
  onDown: (point, { addElement, getState }) => {
    const { activeColor, activeThickness, fillMode, activeTool } = getState();
    const ellipse: TEllipse = {
      x: point.x,
      y: point.y,
      radiusX: 0,
      radiusY: 0,
      color: activeColor,
      thickness: activeThickness,
      tool: activeTool as TEllipse["tool"],
      fillMode,
    };
    addElement(ellipse);
  },
  onMove: (point, { updateLastElement, origin }) => {
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    updateLastElement((el) => ({
      ...el,
      x: origin.x + dx / 2,
      y: origin.y + dy / 2,
      radiusX: Math.abs(dx / 2),
      radiusY: Math.abs(dy / 2),
    }));
  },
  onUp() {
    historyManager.execute(new CommitLastElementCommand());
  },
};

const renderer: ElementRenderer = (ctx, el) => {
  const ellipse = el as TEllipse;
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.ellipse(ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, 0, 0, Math.PI * 2);
  if (ellipse.fillMode === FILL_MODES.FILLED) {
    ctx.fillStyle = ellipse.color ?? "rgba(0,0,0,1)";
    ctx.fill();
  } else {
    ctx.stroke();
  }
};

export function useEllipseTool(): ToolDefinition {
  return { handler, renderer };
}
