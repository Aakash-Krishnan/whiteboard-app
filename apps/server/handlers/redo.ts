// apps/server/handlers/redo.ts
import type { Server, Socket } from "socket.io";
import { rooms } from "../rooms.js";

type RedoPayload = {
  roomId: string;
  userId: string;
};

export function registerRedo(io: Server, socket: Socket): void {
  socket.on("redo", ({ roomId, userId }: RedoPayload) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const stack = room.redoStacks[userId];
    if (!stack || stack.length === 0) return;

    const element = stack.pop()!;
    room.elements.push(element);

    if (!room.undoStacks[userId]) room.undoStacks[userId] = [];
    room.undoStacks[userId].push((element as unknown as { id: string }).id);

    io.to(roomId).emit("redo", { element, userId });
  });
}
