import type { Server, Socket } from "socket.io";
import { rooms } from "../rooms.js";

export function registerStickyDelete(io: Server, socket: Socket): void {
  socket.on("sticky:delete", ({ roomId, id }: { roomId: string; id: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.stickies = room.stickies.filter((s) => s.id !== id);
    socket.to(roomId).emit("sticky:delete", { id });
  });
}
