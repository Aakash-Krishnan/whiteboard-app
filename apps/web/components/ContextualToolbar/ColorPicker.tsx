import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type TColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  label: string;
};

export default function ColorPicker({ value, onChange, label }: TColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted"
          title={label}
        >
          <span
            className="size-4 rounded-sm border border-border shadow-sm"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-muted-foreground">{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-fit p-3" sideOffset={8}>
        <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-32 cursor-pointer rounded-lg border-none bg-transparent p-0"
        />
      </PopoverContent>
    </Popover>
  );
}
