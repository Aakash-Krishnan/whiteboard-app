import { useToolBar } from "@/hooks/context/useToolbar";
import React from "react";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function ColorPicker() {
  const { setActiveColor, activeColor } = useToolBar();

  return (
    <div className="toolbar-color-picker size-5">
      <Tooltip key={`Color Picker`}>
        <TooltipTrigger asChild>
          <Input
            type="color"
            className="size-full"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value as string)}
          />
        </TooltipTrigger>
        <TooltipContent side={"right"}>
          <p>{`Color Picker`}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
