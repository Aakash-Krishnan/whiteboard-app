// apps/server/handlers/disconnect.ts
import type { Server, Socket } from "socket.io";
import { rooms, removeUser } from "../rooms.js";

export function registerDisconnect(io: Server, socket: Socket): void {
  socket.on("disconnect", () => {
    const socketData = socket as unknown as Record<string, unknown>;
    const roomId = socketData.roomId as string | undefined;
    const userId = socketData.userId as string | undefined;
    if (!roomId || !userId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    removeUser(room, userId);
    socket.to(roomId).emit("user-left", { userId });

    if (room.users.length === 0) {
      rooms.delete(roomId);
    }
  });
}
