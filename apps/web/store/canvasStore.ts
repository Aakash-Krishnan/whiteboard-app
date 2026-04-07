import { TPoint, TStroke } from "@whiteboard/types";
import { create } from "zustand";

export type TCanvasState = {
  strokes: TStroke[];
};

export type TCanvasActions = {
  addStroke: (stroke: TStroke) => void;
  addPoint: (point: TPoint) => void;
};

export const useCanvasStore = create<TCanvasState & TCanvasActions>((set) => ({
  strokes: [],
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
}));
