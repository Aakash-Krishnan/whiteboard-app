import type { Server, Socket } from "socket.io";
import { rooms } from "../rooms.js";

export function registerStickyColor(io: Server, socket: Socket): void {
  socket.on(
    "sticky:color",
    ({ roomId, id, bgColor }: { roomId: string; id: string; bgColor: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const sticky = room.stickies.find((s) => s.id === id);
      if (sticky) sticky.bgColor = bgColor;
      socket.to(roomId).emit("sticky:color", { id, bgColor });
    },
  );
}
