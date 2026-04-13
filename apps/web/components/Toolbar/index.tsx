"use client";

import React, { createContext } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { TCanvasActions, TCanvasState } from "@/types/canvasStore";

import Separator from "./Separator";
import Tool from "./Tool";
import { TooltipProvider } from "../ui/tooltip";
import { cn } from "@/lib/utils";

export type TToolBarContext =
  | (Pick<TCanvasState, "activeColor" | "activeTool"> &
      Pick<TCanvasActions, "setActiveColor" | "setActiveTool">)
  | null;

export const ToolBarContext = createContext<TToolBarContext>(null);

export default function Toolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const activeColor = useCanvasStore((state) => state.activeColor);
  const setActiveColor = useCanvasStore((state) => state.setActiveColor);

  return (
    <ToolBarContext.Provider
      value={{ activeTool, setActiveTool, activeColor, setActiveColor }}
    >
      <TooltipProvider>
        <div
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border border-border bg-background/80 p-1.5 shadow-md backdrop-blur-sm",
            className,
          )}
        >
          {children}
        </div>
      </TooltipProvider>
    </ToolBarContext.Provider>
  );
}

Toolbar.Separator = Separator;
Toolbar.Tool = Tool;

export { Toolbar };
