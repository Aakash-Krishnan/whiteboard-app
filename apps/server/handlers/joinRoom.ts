import type { Server, Socket } from "socket.io";
import { getOrCreateRoom, assignColor } from "../rooms.js";

type JoinRoomPayload = {
  roomId: string;
  userId: string;
  name: string;
};

export function registerJoinRoom(io: Server, socket: Socket): void {
  socket.on("join-room", ({ roomId, userId, name }: JoinRoomPayload) => {
    const room = getOrCreateRoom(roomId);
    const color = assignColor(room);

    const user = { id: userId, name, color };
    room.users.push(user);
    room.undoStacks[userId] = [];
    room.redoStacks[userId] = [];

    // Store roomId + userId on socket for disconnect cleanup
    const socketData = socket as unknown as Record<string, unknown>;
    socketData.roomId = roomId;
    socketData.userId = userId;

    socket.join(roomId);

    // Send current state only to the joiner
    socket.emit("room-state", { elements: room.elements, users: room.users, stickies: room.stickies });

    // Tell everyone else about the new user
    socket.to(roomId).emit("user-joined", user);
  });
}
