import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import type { TElement } from "@whiteboard/types";
import { useCanvasStore } from "@/store/canvasStore";
import { historyManager } from "@/history/HistoryManager";

const ROOM_ID = "room-1";
const SERVER_URL = "http://localhost:3001";

export function useSocket(): void {
  const userIdRef = useRef(crypto.randomUUID());
  const addElement = useCanvasStore((state) => state.addElement);

  useEffect(() => {
    const socket = io(SERVER_URL);
    const userId = userIdRef.current;

    socket.emit("join-room", { roomId: ROOM_ID, userId, name: "Guest" });

    // Sync full canvas state when joining a room that already has elements
    socket.on("room-state", ({ elements }: { elements: TElement[] }) => {
      useCanvasStore.setState({ elements });
    });

    // Register outbound emitters — fire when local user draws, undoes, or redoes
    historyManager.setSocketEmitter((element) => {
      socket.emit("draw-event", { roomId: ROOM_ID, userId, element });
    });
    historyManager.setUndoEmitter((elementId) => {
      socket.emit("undo", { roomId: ROOM_ID, userId, elementId });
    });
    historyManager.setRedoEmitter((element) => {
      socket.emit("redo", { roomId: ROOM_ID, userId, element });
    });

    // Incoming draw from another user — add directly, skip historyManager
    socket.on("draw-event", ({ element }: { element: TElement }) => {
      addElement(element);
    });

    // Incoming undo from server — skip if it's our own action
    socket.on(
      "undo",
      ({ elementId, userId: fromUserId }: { elementId: string; userId: string }) => {
        if (fromUserId === userId) return;
        useCanvasStore.setState((state) => ({
          elements: state.elements.filter((el) => el.id !== elementId),
        }));
      },
    );

    // Incoming redo from server — skip if it's our own action
    socket.on(
      "redo",
      ({ element, userId: fromUserId }: { element: TElement; userId: string }) => {
        if (fromUserId === userId) return;
        useCanvasStore.setState((state) => ({
          elements: [...state.elements, element],
        }));
      },
    );

    return () => {
      socket.disconnect();
      historyManager.clearSocketEmitter();
      historyManager.clearUndoRedoEmitters();
    };
  }, [addElement]);
}
