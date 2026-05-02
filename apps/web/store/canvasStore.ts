import { TCanvasActions, TCanvasState } from "@/types/canvasStore";
import { TElement, TPoint, TTool } from "@whiteboard/types";
import { create } from "zustand";
import { TOOL_PROPERTIES, TOOLS } from "@whiteboard/types/constants/global";

export const useCanvasStore = create<TCanvasState & TCanvasActions>((set) => ({
  elements: [],
  activeColor: TOOL_PROPERTIES.color,
  activeTool: TOOLS.PENCIL,
  activeThickness: TOOL_PROPERTIES.width.thin,
  isEraser: false,
  fillMode: "outline",
  addElement: (element: TElement) =>
    set((state) => ({
      elements: [...state.elements, element],
    })),
  updateLastElement: (updater: (element: TElement) => TElement) =>
    set((state) => ({
      elements: state.elements.map((el, idx) =>
        idx === state.elements.length - 1 ? updater(el) : el,
      ),
    })),
  addPoint: (point: TPoint) =>
    set((state) => ({
      elements: state.elements.map((el, idx) => {
        if (idx === state.elements.length - 1 && el.tool === "pencil") {
          return { ...el, path: [...el.path, point] };
        }
        return el;
      }),
    })),
  setActiveColor: (color: string) => set({ activeColor: color }),
  setActiveTool: (tool: TTool) => set({ activeTool: tool }),
  setActiveThickness: (
    thickness: (typeof TOOL_PROPERTIES.width)[keyof typeof TOOL_PROPERTIES.width],
  ) => set({ activeThickness: thickness }),
  setIsEraser: (isEraser: boolean) => set({ isEraser }),
  setFillMode: (fillMode: "filled" | "outline") => set({ fillMode }),
}));
