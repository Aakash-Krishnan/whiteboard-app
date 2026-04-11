import { useToolBar } from "@/hooks/context/useToolbar";
import React from "react";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function ColorPicker() {
  const { setActiveColor, activeColor } = useToolBar();

  return (
    <Tooltip key="Color Picker">
      <TooltipTrigger asChild>
        <div className="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted">
          <Input
            type="color"
            className="size-5 cursor-pointer border-none p-0"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value as string)}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <p>Color Picker</p>
      </TooltipContent>
    </Tooltip>
  );
}
