"use client";

import React from "react";
import {
  ARROW_HEADS,
  DASH_STYLES,
  FILL_MODES,
} from "@whiteboard/types/constants/global";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type TOption = { value: string; label: string };

const OPTIONS_MAP: Record<string, TOption[]> = {
  fillModeOptions: [
    { value: FILL_MODES.OUTLINE, label: "Outline" },
    { value: FILL_MODES.FILLED, label: "Filled" },
  ],
  dashStyleOptions: [
    { value: DASH_STYLES.SOLID, label: "Solid" },
    { value: DASH_STYLES.DASHED, label: "Dashed" },
    { value: DASH_STYLES.DOTTED, label: "Dotted" },
  ],
  arrowHeadOptions: [
    { value: ARROW_HEADS.NONE, label: "None" },
    { value: ARROW_HEADS.START, label: "Start" },
    { value: ARROW_HEADS.BOTH, label: "Both" },
  ],
};

type TDropdownControlProps = {
  label: string;
  optionsKey: string;
  value: string;
  onChange: (value: string) => void;
};

export default function DropdownControl({
  label,
  optionsKey,
  value,
  onChange,
}: TDropdownControlProps) {
  const options = OPTIONS_MAP[optionsKey] ?? [];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
