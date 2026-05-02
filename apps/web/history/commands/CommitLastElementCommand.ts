import type { Command } from "../types";
import type { TElement } from "@whiteboard/types";
import { useCanvasStore } from "@/store/canvasStore";

export class CommitLastElementCommand implements Command {
  private element: TElement;
  private firstRun = true;

  constructor() {
    const elements = useCanvasStore.getState().elements;
    this.element = elements[elements.length - 1]!;
  }

  execute(): void {
    if (this.firstRun) {
      this.firstRun = false;
      return;
    }
    useCanvasStore.setState((state) => ({
      elements: [...state.elements, this.element],
    }));
  }

  undo(): void {
    useCanvasStore.setState((state) => ({
      elements: state.elements.slice(0, -1),
    }));
  }
}
