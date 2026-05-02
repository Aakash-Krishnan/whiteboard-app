import type { Command } from "../types";
import type { TElement } from "@whiteboard/types";
import { useCanvasStore } from "@/store/canvasStore";

export class UpdateElementCommand implements Command {
  constructor(
    private before: TElement,
    private after: TElement,
    private index: number,
  ) {}

  execute(): void {
    useCanvasStore.setState((state) => ({
      elements: state.elements.map((el, i) =>
        i === this.index ? this.after : el,
      ),
    }));
  }

  undo(): void {
    useCanvasStore.setState((state) => ({
      elements: state.elements.map((el, i) =>
        i === this.index ? this.before : el,
      ),
    }));
  }
}
