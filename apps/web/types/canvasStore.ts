import { TElement, TPoint, TTool } from "@whiteboard/types";
import { TOOL_PROPERTIES } from "@whiteboard/types/constants/global";

export type TCanvasState = {
  elements: TElement[];
  activeColor: string;
  activeTool: TTool;
  activeThickness: number;
  isEraser: boolean;
  fillMode: "filled" | "outline";
};

export type TCanvasActions = {
  addElement: (element: TElement) => void;
  updateLastElement: (updater: (element: TElement) => TElement) => void;
  addPoint: (point: TPoint) => void;
  setActiveColor: (color: string) => void;
  setActiveTool: (tool: TTool) => void;
  setActiveThickness: (
    thickness: (typeof TOOL_PROPERTIES.width)[keyof typeof TOOL_PROPERTIES.width],
  ) => void;
  setIsEraser: (isEraser: boolean) => void;
  setFillMode: (fillMode: "filled" | "outline") => void;
};
