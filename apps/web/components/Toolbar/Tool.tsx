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
};

export default function Tool(props: TToolProps) {
  const { icon, tool, label } = props;
  const { activeTool, setActiveTool } = useToolBar();

  return (
    <div className="toolbar-tool">
      <Tooltip key={label}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="w-fit capitalize"
            onClick={() => setActiveTool(tool)}
            disabled={tool === activeTool}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
