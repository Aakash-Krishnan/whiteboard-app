import { useToolBar } from "@/hooks/context/useToolbar";
import { TTool } from "@whiteboard/types";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TToolProps = {
  icon: React.ReactNode;
  tool: TTool;
  label: string;
  shortcut?: string;
};

export default function Tool(props: TToolProps) {
  const { icon, tool, label, shortcut } = props;
  const { activeTool, setActiveTool } = useToolBar();

  const handleClick = () => {
    if (tool !== activeTool) {
      setActiveTool(tool);
    }
  };

  return (
    <Tooltip key={label}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            tool === activeTool
              ? "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "cursor-pointer hover:bg-muted transition-colors"
          }
          onClick={handleClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <p>{label}{shortcut && <kbd className="ml-2 opacity-60 text-[10px] border border-current rounded px-1">{shortcut}</kbd>}</p>
      </TooltipContent>
    </Tooltip>
  );
}
