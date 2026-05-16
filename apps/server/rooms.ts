import type { TElement } from "@whiteboard/types";

export type RoomUser = {
  id: string;
  name: string;
  color: string;
};

export type Room = {
  users: RoomUser[];
  elements: TElement[];
  undoStacks: Record<string, string[]>;   // userId → element IDs they drew
  redoStacks: Record<string, TElement[]>; // userId → elements removed by undo
};

export const PALETTE = [
  "#e03131", "#2f9e44", "#1971c2", "#f08c00", "#7048e8",
  "#0c8599", "#c2255c", "#5c7cfa", "#74b816", "#f76707",
  "#a61e4d", "#2b8a3e",
];

export const rooms = new Map<string, Room>();

export function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: [], elements: [], undoStacks: {}, redoStacks: {} });
  }
  return rooms.get(roomId)!;
}

export function assignColor(room: Room): string {
  const usedColors = new Set(room.users.map((u) => u.color));
  return PALETTE.find((c) => !usedColors.has(c)) ?? PALETTE[room.users.length % PALETTE.length]!;
}

export function removeUser(room: Room, userId: string): void {
  room.users = room.users.filter((u) => u.id !== userId);
  delete room.undoStacks[userId];
  delete room.redoStacks[userId];
}
