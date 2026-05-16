import type { Server, Socket } from "socket.io";
import { rooms } from "../rooms.js";

export function registerStickyEdit(io: Server, socket: Socket): void {
  socket.on(
    "sticky:edit",
    ({ roomId, id, text }: { roomId: string; id: string; text: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const sticky = room.stickies.find((s) => s.id === id);
      if (sticky) sticky.text = text;
      socket.to(roomId).emit("sticky:edit", { id, text });
    },
  );
}
