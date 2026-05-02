import React from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { TOOL_PROPERTIES } from "@whiteboard/types/constants/global";

type TFontSizeSelectorProps = {
  value: number;
  onChange: (size: number) => void;
  label: string;
};

const sizes = Object.entries(TOOL_PROPERTIES.fontSize) as [
  string,
  (typeof TOOL_PROPERTIES.fontSize)[keyof typeof TOOL_PROPERTIES.fontSize],
][];

export default function FontSizeSelector({ value, onChange, label }: TFontSizeSelectorProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          {sizes.map(([name, size]) => (
            <Button
              key={name}
              variant="ghost"
              size="icon"
              className={value === size ? "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "cursor-pointer hover:bg-muted transition-colors"}
              onClick={() => onChange(size)}
            >
              <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>A</span>
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
