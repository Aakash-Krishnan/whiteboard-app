// apps/server/handlers/drawEvent.ts
import type { Server, Socket } from "socket.io";
import type { TElement } from "@whiteboard/types";
import { rooms } from "../rooms.js";

type DrawEventPayload = {
  roomId: string;
  userId: string;
  element: TElement;
};

export function registerDrawEvent(io: Server, socket: Socket): void {
  socket.on("draw-event", ({ roomId, userId, element }: DrawEventPayload) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.elements.push(element);

    if (!room.undoStacks[userId]) room.undoStacks[userId] = [];
    room.undoStacks[userId].push((element as unknown as { id: string }).id);

    // New draw clears redo history for this user
    room.redoStacks[userId] = [];

    socket.to(roomId).emit("draw-event", { element });
  });
}
