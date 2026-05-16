// apps/server/handlers/undo.ts
import type { Server, Socket } from "socket.io";
import { rooms } from "../rooms.js";

type UndoPayload = {
  roomId: string;
  userId: string;
};

export function registerUndo(io: Server, socket: Socket): void {
  socket.on("undo", ({ roomId, userId }: UndoPayload) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const stack = room.undoStacks[userId];
    if (!stack || stack.length === 0) return;

    const elementId = stack.pop()!;
    const idx = room.elements.findIndex((el) => (el as unknown as { id: string }).id === elementId);
    if (idx === -1) return;

    const [removed] = room.elements.splice(idx, 1);
    if (!room.redoStacks[userId]) room.redoStacks[userId] = [];
    room.redoStacks[userId].push(removed!);

    io.to(roomId).emit("undo", { elementId, userId });
  });
}
