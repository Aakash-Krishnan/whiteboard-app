import { TPoint, TStroke, TTool } from "@whiteboard/types";
import { TOOL_PROPERTIES } from "@whiteboard/types/constants/global";

export type TCanvasState = {
  strokes: TStroke[];
  activeColor: string;
  activeTool: TTool;
  activeToolWidth: number;
  isEraser: boolean;
};

export type TCanvasActions = {
  addStroke: (stroke: TStroke) => void;
  addPoint: (point: TPoint) => void;
  setActiveColor: (color: string) => void;
  setActiveTool: (tool: TTool) => void;
  setActiveToolWidth: (
    width: (typeof TOOL_PROPERTIES.width)[keyof typeof TOOL_PROPERTIES.width],
  ) => void;
  setIsEraser: (isEraser: boolean) => void;
};
