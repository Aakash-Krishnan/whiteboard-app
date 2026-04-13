"use client";

import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/canvasStore";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CONTROL_TYPES,
  TOOL_CONTROLS,
} from "@whiteboard/types/constants/global";
import React from "react";
import ColorPicker from "./ColorPicker";
import EraserToggle from "./EraserToggle";
import WidthSelector from "./WidthSelector";

export default function ContextualToolbar({
  className,
}: {
  className?: string;
}) {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const activeColor = useCanvasStore((state) => state.activeColor);
  const activeToolWidth = useCanvasStore((state) => state.activeToolWidth);
  const isEraser = useCanvasStore((state) => state.isEraser);
  const setActiveColor = useCanvasStore((state) => state.setActiveColor);
  const setActiveToolWidth = useCanvasStore((state) => state.setActiveToolWidth);
  const setIsEraser = useCanvasStore((state) => state.setIsEraser);

  const controls =
    (TOOL_CONTROLS as Record<string, typeof TOOL_CONTROLS[keyof typeof TOOL_CONTROLS]>)[activeTool] ?? [];

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center gap-1 rounded-xl border border-border bg-background/80 px-3 py-1.5 shadow-md backdrop-blur-sm",
          className,
        )}
      >
        {controls.map((control) => {
          switch (control.type) {
            case CONTROL_TYPES.COLOR_PICKER:
              return (
                <ColorPicker
                  key={control.type}
                  value={activeColor}
                  onChange={setActiveColor}
                  label={control.label}
                />
              );
            case CONTROL_TYPES.WIDTH_SELECTOR:
              return (
                <WidthSelector
                  key={control.type}
                  value={activeToolWidth}
                  onChange={setActiveToolWidth}
                  label={control.label}
                />
              );
            case CONTROL_TYPES.TOGGLE:
              return (
                <EraserToggle
                  key={control.type}
                  value={isEraser}
                  onChange={setIsEraser}
                  label={control.label}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </TooltipProvider>
  );
}
