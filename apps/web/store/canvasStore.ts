import { TCanvasActions, TCanvasState } from "@/types/canvasStore";
import { TPoint, TStroke, TTool } from "@whiteboard/types";
import { create } from "zustand";
import { TOOL_PROPERTIES, TOOLS } from "@whiteboard/types/constants/global";

export const useCanvasStore = create<TCanvasState & TCanvasActions>((set) => ({
  strokes: [],
  activeColor: TOOL_PROPERTIES.color,
  activeTool: TOOLS.PENCIL,
  activeToolWidth: TOOL_PROPERTIES.width.thin,
  isEraser: false,
  addStroke: (stroke: TStroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
    })),
  addPoint: (point: TPoint) =>
    set((state) => ({
      strokes: state.strokes.map((stroke, idx) => {
        if (idx === state.strokes.length - 1) {
          return {
            ...stroke,
            path: [...stroke.path, point],
          };
        } else {
          return stroke;
        }
      }),
    })),
  setActiveColor: (color: string) => set({ activeColor: color }),
  setActiveTool: (tool: TTool) => set({ activeTool: tool }),
  setActiveToolWidth: (
    width: (typeof TOOL_PROPERTIES.width)[keyof typeof TOOL_PROPERTIES.width],
  ) => set({ activeToolWidth: width }),
  setIsEraser: (isEraser: boolean) => set({ isEraser }),
}));
