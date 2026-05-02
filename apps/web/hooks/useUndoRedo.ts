import { useCallback, useSyncExternalStore } from "react";
import { historyManager } from "@/history/HistoryManager";

function subscribe(callback: () => void) {
  return historyManager.subscribe(callback);
}

function getSnapshot() {
  return historyManager.getSnapshot();
}

const SERVER_SNAPSHOT = { canUndo: false, canRedo: false };
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function useUndoRedo() {
  const { canUndo, canRedo } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const undo = useCallback(() => historyManager.undo(), []);
  const redo = useCallback(() => historyManager.redo(), []);

  return { undo, redo, canUndo, canRedo };
}
