import type { Server, Socket } from "socket.io";
import type { TStickyNote } from "@whiteboard/types";
import { rooms } from "../rooms.js";

export function registerStickyAdd(io: Server, socket: Socket): void {
  socket.on("sticky:add", ({ roomId, note }: { roomId: string; note: TStickyNote }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.stickies.push(note);
    socket.to(roomId).emit("sticky:add", { note });
  });
}
