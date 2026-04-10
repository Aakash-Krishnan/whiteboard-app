"use client";

import React, { createContext } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { TCanvasActions, TCanvasState } from "@/types/canvasStore";
import ColorPicker from "./ColorPicker";
import Separator from "./Separator";
import Tool from "./Tool";
import { TooltipProvider } from "../ui/tooltip";

export type TToolBarContext =
  | (Pick<TCanvasState, "activeColor" | "activeTool"> &
      Pick<TCanvasActions, "setActiveColor" | "setActiveTool">)
  | null;

export const ToolBarContext = createContext<TToolBarContext>(null);

export default function Toolbar({ children }: { children: React.ReactNode }) {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const activeColor = useCanvasStore((state) => state.activeColor);
  const setActiveColor = useCanvasStore((state) => state.setActiveColor);

  return (
    <ToolBarContext.Provider
      value={{ activeTool, setActiveTool, activeColor, setActiveColor }}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </ToolBarContext.Provider>
  );
}

Toolbar.ColorPicker = ColorPicker;
Toolbar.Separator = Separator;
Toolbar.Tool = Tool;

export { Toolbar };
