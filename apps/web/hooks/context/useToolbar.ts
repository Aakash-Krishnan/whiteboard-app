import { ToolBarContext } from "@/components/Toolbar";
import { useContext } from "react";

export const useToolBar = () => {
  const context = useContext(ToolBarContext);
  if (!context) {
    throw new Error("useToolBar must be used within a Toolbar");
  }
  return context;
};
