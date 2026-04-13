import React from "react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { EraserIcon } from "lucide-react";

type TEraserToggleProps = {
  value: boolean;
  onChange: (isEraser: boolean) => void;
  label: string;
};

export default function EraserToggle({ value, onChange, label }: TEraserToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={value ? "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "cursor-pointer hover:bg-muted transition-colors"}
          onClick={() => onChange(!value)}
        >
          <EraserIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
