import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import type { TElement, TStickyNote } from "@whiteboard/types";
import { useCanvasStore } from "@/store/canvasStore";
import { historyManager } from "@/history/HistoryManager";

const ROOM_ID = "room-1";
const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";

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

function buildUserList(
  usersRef: React.MutableRefObject<Record<string, UserMeta>>,
): UserInfo[] {
  return Object.entries(usersRef.current).map(([userId, meta]) => ({
    userId,
    name: meta.name,
    color: meta.color,
  }));
}

type StickyCallbacks = {
  onStickyAdd?: (note: TStickyNote) => void;
  onStickyMove?: (payload: { id: string; x: number; y: number }) => void;
  onStickyEdit?: (payload: { id: string; text: string }) => void;
  onStickyColor?: (payload: { id: string; bgColor: string }) => void;
  onStickyDelete?: (payload: { id: string }) => void;
};

export function useSocket(
  onCursorMove: (cursor: CursorInfo) => void,
  onUserLeft: (userId: string) => void,
  onUsersChange: (users: UserInfo[]) => void,
  stickyCallbacks: StickyCallbacks = {},
): {
  emitCursor: (x: number, y: number) => void;
  emitStickyAdd: (note: TStickyNote) => void;
  emitStickyMove: (id: string, x: number, y: number) => void;
  emitStickyEdit: (id: string, text: string) => void;
  emitStickyColor: (id: string, bgColor: string) => void;
  emitStickyDelete: (id: string) => void;
} {
  const userIdRef = useRef(crypto.randomUUID());
  const addElement = useCanvasStore((state) => state.addElement);
  const usersRef = useRef<Record<string, UserMeta>>({});
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const stickyCallbacksRef = useRef(stickyCallbacks);
  stickyCallbacksRef.current = stickyCallbacks;

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;
    const userId = userIdRef.current;

    socket.emit("join-room", { roomId: ROOM_ID, userId, name: "Guest" });

    // Sync full canvas state + build users map when joining
    socket.on(
      "room-state",
      ({
        elements,
        stickies,
        users,
      }: {
        elements: TElement[];
        stickies: TStickyNote[];
        users: { id: string; name: string; color: string }[];
      }) => {
        useCanvasStore.setState({ elements });
        if (stickies?.length) {
          stickies.forEach((note: TStickyNote) =>
            stickyCallbacksRef.current.onStickyAdd?.(note),
          );
        }
        users.forEach((u) => {
          if (u.id !== userId)
            usersRef.current[u.id] = { name: u.name, color: u.color };
        });
        onUsersChange(buildUserList(usersRef));
      },
    );

    // Track new users joining
    socket.on(
      "user-joined",
      (user: { id: string; name: string; color: string }) => {
        if (user.id !== userId) {
          usersRef.current[user.id] = { name: user.name, color: user.color };
          onUsersChange(buildUserList(usersRef));
        }
      },
    );

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
      ({
        elementId,
        userId: fromUserId,
      }: {
        elementId: string;
        userId: string;
      }) => {
        if (fromUserId === userId) return;
        useCanvasStore.setState((state) => ({
          elements: state.elements.filter((el) => el.id !== elementId),
        }));
      },
    );

    // Incoming redo from server — skip if own
    socket.on(
      "redo",
      ({
        element,
        userId: fromUserId,
      }: {
        element: TElement;
        userId: string;
      }) => {
        if (fromUserId === userId) return;
        useCanvasStore.setState((state) => ({
          elements: [...state.elements, element],
        }));
      },
    );

    // Incoming cursor from another user
    socket.on(
      "cursor-move",
      ({
        userId: fromUserId,
        x,
        y,
      }: {
        userId: string;
        x: number;
        y: number;
      }) => {
        const meta = usersRef.current[fromUserId];
        if (!meta) return;
        onCursorMove({
          userId: fromUserId,
          x,
          y,
          name: meta.name,
          color: meta.color,
        });
      },
    );

    // User disconnected
    socket.on("user-left", ({ userId: leftUserId }: { userId: string }) => {
      delete usersRef.current[leftUserId];
      onUserLeft(leftUserId);
      onUsersChange(buildUserList(usersRef));
    });

    socket.on("sticky:add", ({ note }: { note: TStickyNote }) => {
      stickyCallbacksRef.current.onStickyAdd?.(note);
    });
    socket.on(
      "sticky:move",
      (payload: { id: string; x: number; y: number }) => {
        stickyCallbacksRef.current.onStickyMove?.(payload);
      },
    );
    socket.on("sticky:edit", (payload: { id: string; text: string }) => {
      stickyCallbacksRef.current.onStickyEdit?.(payload);
    });
    socket.on("sticky:color", (payload: { id: string; bgColor: string }) => {
      stickyCallbacksRef.current.onStickyColor?.(payload);
    });
    socket.on("sticky:delete", (payload: { id: string }) => {
      stickyCallbacksRef.current.onStickyDelete?.(payload);
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

  const emitStickyAdd = (note: TStickyNote) => {
    socketRef.current?.emit("sticky:add", { roomId: ROOM_ID, note });
  };
  const emitStickyMove = (id: string, x: number, y: number) => {
    socketRef.current?.emit("sticky:move", { roomId: ROOM_ID, id, x, y });
  };
  const emitStickyEdit = (id: string, text: string) => {
    socketRef.current?.emit("sticky:edit", { roomId: ROOM_ID, id, text });
  };
  const emitStickyColor = (id: string, bgColor: string) => {
    socketRef.current?.emit("sticky:color", { roomId: ROOM_ID, id, bgColor });
  };
  const emitStickyDelete = (id: string) => {
    socketRef.current?.emit("sticky:delete", { roomId: ROOM_ID, id });
  };

  return {
    emitCursor,
    emitStickyAdd,
    emitStickyMove,
    emitStickyEdit,
    emitStickyColor,
    emitStickyDelete,
  };
}
