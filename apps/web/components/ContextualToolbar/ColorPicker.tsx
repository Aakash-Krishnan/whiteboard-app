import React from "react";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";

type TColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  label: string;
};

export default function ColorPicker({ value, onChange, label }: TColorPickerProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted">
          <Input
            type="color"
            className="size-5 cursor-pointer border-none p-0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
