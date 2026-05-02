import type { TRectangle } from "@whiteboard/types";
import { FILL_MODES } from "@whiteboard/types/constants/global";
import type { ElementRenderer, ToolDefinition, ToolHandler } from "../drawing/types";
import { historyManager } from "@/history/HistoryManager";
import { CommitLastElementCommand } from "@/history/commands/CommitLastElementCommand";

const handler: ToolHandler = {
  onDown: (point, { addElement, getState }) => {
    const { activeColor, activeThickness, fillMode, activeTool } = getState();
    const rect: TRectangle = {
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      color: activeColor,
      thickness: activeThickness,
      tool: activeTool as TRectangle["tool"],
      fillMode,
    };
    addElement(rect);
  },
  onMove: (point, { updateLastElement, origin }) => {
    updateLastElement((el) => ({
      ...el,
      width: point.x - origin.x,
      height: point.y - origin.y,
    }));
  },
  onUp() {
    historyManager.execute(new CommitLastElementCommand());
  },
};

const renderer: ElementRenderer = (ctx, el) => {
  const rect = el as TRectangle;
  ctx.globalCompositeOperation = "source-over";
  if (rect.fillMode === FILL_MODES.FILLED) {
    ctx.fillStyle = rect.color ?? "rgba(0,0,0,1)";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  } else {
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }
};

export function useRectangleTool(): ToolDefinition {
  return { handler, renderer };
}
