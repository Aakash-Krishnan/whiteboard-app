import { TPoint, TStroke } from "@whiteboard/types";
import { create } from "zustand";

export type TCanvasState = {
  strokes: TStroke[];
  activeColor: string;
};

export type TCanvasActions = {
  addStroke: (stroke: TStroke) => void;
  addPoint: (point: TPoint) => void;
  setActiveColor: (color: string) => void;
};

export const useCanvasStore = create<TCanvasState & TCanvasActions>((set) => ({
  strokes: [],
  activeColor: "#000000",
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
}));
