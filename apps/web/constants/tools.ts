import { TOOLS } from "@whiteboard/types/constants/global";
import type { TTool } from "@whiteboard/types";

export const TOOL_KEYS: Record<string, { tool: TTool; eraser: boolean }> = {
  p: { tool: TOOLS.PENCIL, eraser: false },
  r: { tool: TOOLS.RECTANGLE, eraser: false },
  c: { tool: TOOLS.CIRCLE, eraser: false },
  l: { tool: TOOLS.LINE, eraser: false },
  t: { tool: TOOLS.TEXT, eraser: false },
  e: { tool: TOOLS.PENCIL, eraser: true },
};
