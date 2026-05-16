import type { TElement } from "@whiteboard/types";
import type { Command } from "./types";
import { AddElementCommand } from "./commands/AddElementCommand";
import { CommitLastElementCommand } from "./commands/CommitLastElementCommand";

type Listener = () => void;

class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private listeners: Listener[] = [];
  private _snapshot = { canUndo: false, canRedo: false };
  private socketEmitter: ((element: TElement) => void) | null = null;
  private undoEmitter: ((elementId: string) => void) | null = null;
  private redoEmitter: ((element: TElement) => void) | null = null;

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

  setSocketEmitter(fn: (element: TElement) => void): void {
    this.socketEmitter = fn;
  }

  clearSocketEmitter(): void {
    this.socketEmitter = null;
  }

  setUndoEmitter(fn: (elementId: string) => void): void {
    this.undoEmitter = fn;
  }

  setRedoEmitter(fn: (element: TElement) => void): void {
    this.redoEmitter = fn;
  }

  clearUndoRedoEmitters(): void {
    this.undoEmitter = null;
    this.redoEmitter = null;
  }

  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.notify();
    if (command instanceof AddElementCommand || command instanceof CommitLastElementCommand) {
      this.socketEmitter?.(command.element);
    }
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) return;
    command.undo();
    this.redoStack.push(command);
    this.notify();
    if (command instanceof AddElementCommand || command instanceof CommitLastElementCommand) {
      this.undoEmitter?.(command.element.id);
    }
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) return;
    command.execute();
    this.undoStack.push(command);
    this.notify();
    if (command instanceof AddElementCommand || command instanceof CommitLastElementCommand) {
      this.redoEmitter?.(command.element);
    }
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}

export const historyManager = new HistoryManager();
