import type { TLine } from "@whiteboard/types";
import { ARROW_HEADS, DASH_STYLES } from "@whiteboard/types/constants/global";
import type { ElementRenderer, ToolDefinition, ToolHandler } from "../drawing/types";
import { historyManager } from "@/history/HistoryManager";
import { CommitLastElementCommand } from "@/history/commands/CommitLastElementCommand";

const handler: ToolHandler = {
  onDown: (point, { addElement, getState }) => {
    const { activeColor, activeThickness, dashStyle, arrowHead, activeTool } = getState();
    const line: TLine = {
      x: point.x,
      y: point.y,
      endPoint: { x: point.x, y: point.y },
      color: activeColor,
      thickness: activeThickness,
      tool: activeTool as TLine["tool"],
      dashStyle,
      arrowHead,
    };
    addElement(line);
  },
  onMove: (point, { updateLastElement }) => {
    updateLastElement((el) => ({ ...el, endPoint: point }));
  },
  onUp() {
    historyManager.execute(new CommitLastElementCommand());
  },
};

const renderer: ElementRenderer = (ctx, el) => {
  const line = el as TLine;
  ctx.globalCompositeOperation = "source-over";

  const dashMap = {
    [DASH_STYLES.SOLID]: [],
    [DASH_STYLES.DASHED]: [8, 4],
    [DASH_STYLES.DOTTED]: [2, 4],
  } as const;
  ctx.setLineDash([...dashMap[line.dashStyle]]);

  ctx.beginPath();
  ctx.moveTo(line.x, line.y);
  ctx.lineTo(line.endPoint.x, line.endPoint.y);
  ctx.stroke();

  const angle = Math.atan2(line.endPoint.y - line.y, line.endPoint.x - line.x);
  const arrowLen = Math.max(12, line.thickness * 4);
  const spread = Math.PI / 7;

  function drawChevron(tipX: number, tipY: number, dir: number) {
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(tipX - arrowLen * Math.cos(dir - spread), tipY - arrowLen * Math.sin(dir - spread));
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(tipX - arrowLen * Math.cos(dir + spread), tipY - arrowLen * Math.sin(dir + spread));
    ctx.stroke();
  }

  if (line.arrowHead === ARROW_HEADS.START || line.arrowHead === ARROW_HEADS.BOTH)
    drawChevron(line.x, line.y, angle + Math.PI);
  if (line.arrowHead === ARROW_HEADS.BOTH)
    drawChevron(line.endPoint.x, line.endPoint.y, angle);

  ctx.setLineDash([]);
};

export function useLineTool(): ToolDefinition {
  return { handler, renderer };
}
