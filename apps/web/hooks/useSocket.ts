import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import type { TElement } from "@whiteboard/types";
import { useCanvasStore } from "@/store/canvasStore";
import { historyManager } from "@/history/HistoryManager";

const ROOM_ID = "room-1";
const SERVER_URL = "http://localhost:3001";

export type CursorInfo = {
  userId: string;
  x: number;
  y: number;
  name: string;
  color: string;
};

export type UserInfo = {
  userId: string;
  name: string;
  color: string;
};

type UserMeta = { name: string; color: string };

function buildUserList(usersRef: React.MutableRefObject<Record<string, UserMeta>>): UserInfo[] {
  return Object.entries(usersRef.current).map(([userId, meta]) => ({
    userId,
    name: meta.name,
    color: meta.color,
  }));
}

export function useSocket(
  onCursorMove: (cursor: CursorInfo) => void,
  onUserLeft: (userId: string) => void,
  onUsersChange: (users: UserInfo[]) => void,
): { emitCursor: (x: number, y: number) => void } {
  const userIdRef = useRef(crypto.randomUUID());
  const addElement = useCanvasStore((state) => state.addElement);
  const usersRef = useRef<Record<string, UserMeta>>({});
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;
    const userId = userIdRef.current;

    socket.emit("join-room", { roomId: ROOM_ID, userId, name: "Guest" });

    // Sync full canvas state + build users map when joining
    socket.on(
      "room-state",
      ({ elements, users }: { elements: TElement[]; users: { id: string; name: string; color: string }[] }) => {
        useCanvasStore.setState({ elements });
        users.forEach((u) => {
          if (u.id !== userId) usersRef.current[u.id] = { name: u.name, color: u.color };
        });
        onUsersChange(buildUserList(usersRef));
      },
    );

    // Track new users joining
    socket.on("user-joined", (user: { id: string; name: string; color: string }) => {
      if (user.id !== userId) {
        usersRef.current[user.id] = { name: user.name, color: user.color };
        onUsersChange(buildUserList(usersRef));
      }
    });

    // Register outbound emitters
    historyManager.setSocketEmitter((element) => {
      socket.emit("draw-event", { roomId: ROOM_ID, userId, element });
    });
    historyManager.setUndoEmitter((elementId) => {
      socket.emit("undo", { roomId: ROOM_ID, userId, elementId });
    });
    historyManager.setRedoEmitter((element) => {
      socket.emit("redo", { roomId: ROOM_ID, userId, element });
    });

    // Incoming draw from another user
    socket.on("draw-event", ({ element }: { element: TElement }) => {
      addElement(element);
    });

    // Incoming undo from server — skip if own
    socket.on(
      "undo",
      ({ elementId, userId: fromUserId }: { elementId: string; userId: string }) => {
        if (fromUserId === userId) return;
        useCanvasStore.setState((state) => ({
          elements: state.elements.filter((el) => el.id !== elementId),
        }));
      },
    );

    // Incoming redo from server — skip if own
    socket.on(
      "redo",
      ({ element, userId: fromUserId }: { element: TElement; userId: string }) => {
        if (fromUserId === userId) return;
        useCanvasStore.setState((state) => ({
          elements: [...state.elements, element],
        }));
      },
    );

    // Incoming cursor from another user
    socket.on(
      "cursor-move",
      ({ userId: fromUserId, x, y }: { userId: string; x: number; y: number }) => {
        const meta = usersRef.current[fromUserId];
        if (!meta) return;
        onCursorMove({ userId: fromUserId, x, y, name: meta.name, color: meta.color });
      },
    );

    // User disconnected
    socket.on("user-left", ({ userId: leftUserId }: { userId: string }) => {
      delete usersRef.current[leftUserId];
      onUserLeft(leftUserId);
      onUsersChange(buildUserList(usersRef));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      historyManager.clearSocketEmitter();
      historyManager.clearUndoRedoEmitters();
    };
  }, [addElement, onCursorMove, onUserLeft, onUsersChange]);

  const emitCursor = (x: number, y: number) => {
    socketRef.current?.emit("cursor-move", {
      roomId: ROOM_ID,
      userId: userIdRef.current,
      x,
      y,
    });
  };

  return { emitCursor };
}
