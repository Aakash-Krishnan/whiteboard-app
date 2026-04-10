import { TPoint, TStroke, TTool } from "@whiteboard/types";

export type TCanvasState = {
  strokes: TStroke[];
  activeColor: string;
  activeTool: TTool;
};

export type TCanvasActions = {
  addStroke: (stroke: TStroke) => void;
  addPoint: (point: TPoint) => void;
  setActiveColor: (color: string) => void;
  setActiveTool: (tool: TTool) => void;
};
