import type { Command } from "../types";
import type { TElement } from "@whiteboard/types";
import { useCanvasStore } from "@/store/canvasStore";

export class AddElementCommand implements Command {
  constructor(private element: TElement) {}

  execute(): void {
    useCanvasStore.getState().addElement(this.element);
  }

  undo(): void {
    useCanvasStore.setState((state) => ({
      elements: state.elements.slice(0, -1),
    }));
  }
}
