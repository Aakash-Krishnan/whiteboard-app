import React from "react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { TOOL_PROPERTIES } from "@whiteboard/types/constants/global";

type TWidthSelectorProps = {
  value: number;
  onChange: (width: (typeof TOOL_PROPERTIES.width)[keyof typeof TOOL_PROPERTIES.width]) => void;
  label: string;
};

const widths = Object.entries(TOOL_PROPERTIES.width) as [
  string,
  (typeof TOOL_PROPERTIES.width)[keyof typeof TOOL_PROPERTIES.width],
][];

export default function WidthSelector({ value, onChange, label }: TWidthSelectorProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          {widths.map(([name, width]) => (
            <Button
              key={name}
              variant="ghost"
              size="icon"
              className={value === width ? "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "cursor-pointer hover:bg-muted transition-colors"}
              onClick={() => onChange(width)}
            >
              <span
                className="rounded-full bg-current"
                style={{ width: width + 2, height: width + 2 }}
              />
            </Button>
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
