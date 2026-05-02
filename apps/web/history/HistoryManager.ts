import type { Command } from "./types";

type Listener = () => void;

class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private listeners: Listener[] = [];
  private _snapshot = { canUndo: false, canRedo: false };

  private notify() {
    this._snapshot = {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
    };
    this.listeners.forEach((fn) => fn());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getSnapshot() {
    return this._snapshot;
  }

  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.notify();
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) return;
    command.undo();
    this.redoStack.push(command);
    this.notify();
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) return;
    command.execute();
    this.undoStack.push(command);
    this.notify();
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}

export const historyManager = new HistoryManager();
