// apps/server/handlers/cursorMove.ts
import type { Server, Socket } from "socket.io";

type CursorMovePayload = {
  roomId: string;
  userId: string;
  x: number;
  y: number;
};

export function registerCursorMove(io: Server, socket: Socket): void {
  socket.on("cursor-move", ({ roomId, userId, x, y }: CursorMovePayload) => {
    socket.to(roomId).emit("cursor-move", { userId, x, y });
  });
}
