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
import DropdownControl from "./DropdownControl";
import EraserToggle from "./EraserToggle";
import WidthSelector from "./WidthSelector";

export default function ContextualToolbar({
  className,
}: {
  className?: string;
}) {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const activeColor = useCanvasStore((state) => state.activeColor);
  const activeThickness = useCanvasStore((state) => state.activeThickness);
  const isEraser = useCanvasStore((state) => state.isEraser);
  const fillMode = useCanvasStore((state) => state.fillMode);
  const dashStyle = useCanvasStore((state) => state.dashStyle);
  const arrowHead = useCanvasStore((state) => state.arrowHead);
  const setActiveColor = useCanvasStore((state) => state.setActiveColor);
  const setActiveThickness = useCanvasStore((state) => state.setActiveThickness);
  const setIsEraser = useCanvasStore((state) => state.setIsEraser);
  const setFillMode = useCanvasStore((state) => state.setFillMode);
  const setDashStyle = useCanvasStore((state) => state.setDashStyle);
  const setArrowHead = useCanvasStore((state) => state.setArrowHead);

  const dropdownState: Record<string, { value: string; onChange: (v: string) => void }> = {
    fillMode: { value: fillMode, onChange: (v) => setFillMode(v as typeof fillMode) },
    dashStyle: { value: dashStyle, onChange: (v) => setDashStyle(v as typeof dashStyle) },
    arrowHead: { value: arrowHead, onChange: (v) => setArrowHead(v as typeof arrowHead) },
  };

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
                  value={activeThickness}
                  onChange={setActiveThickness}
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
            case CONTROL_TYPES.DROPDOWN: {
              const stateKey = (control as { stateKey?: string }).stateKey;
              const optionsKey = (control as { optionsKey?: string }).optionsKey;
              if (!stateKey || !optionsKey) return null;
              const state = dropdownState[stateKey];
              if (!state) return null;
              return (
                <DropdownControl
                  key={stateKey}
                  label={control.label}
                  optionsKey={optionsKey}
                  value={state.value}
                  onChange={state.onChange}
                />
              );
            }
            default:
              return null;
          }
        })}
      </div>
    </TooltipProvider>
  );
}
