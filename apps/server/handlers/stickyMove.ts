import type { Server, Socket } from "socket.io";
import { rooms } from "../rooms.js";

export function registerStickyMove(io: Server, socket: Socket): void {
  socket.on(
    "sticky:move",
    ({ roomId, id, x, y }: { roomId: string; id: string; x: number; y: number }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const sticky = room.stickies.find((s) => s.id === id);
      if (sticky) { sticky.x = x; sticky.y = y; }
      socket.to(roomId).emit("sticky:move", { id, x, y });
    },
  );
}
