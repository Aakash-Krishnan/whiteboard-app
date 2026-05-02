import { useCallback, useSyncExternalStore } from "react";
import { historyManager } from "@/history/HistoryManager";

function subscribe(callback: () => void) {
  return historyManager.subscribe(callback);
}

function getSnapshot() {
  return historyManager.getSnapshot();
}

export function useUndoRedo() {
  const { canUndo, canRedo } = useSyncExternalStore(subscribe, getSnapshot, () => ({ canUndo: false, canRedo: false }));

  const undo = useCallback(() => historyManager.undo(), []);
  const redo = useCallback(() => historyManager.redo(), []);

  return { undo, redo, canUndo, canRedo };
}
