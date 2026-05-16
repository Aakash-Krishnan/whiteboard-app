import type { TStickyNote } from "@whiteboard/types";

export type TStickyState = {
  stickies: TStickyNote[];
};

export type TStickyActions = {
  addSticky: (sticky: TStickyNote) => void;
  moveSticky: (id: string, x: number, y: number) => void;
  editSticky: (id: string, text: string) => void;
  colorSticky: (id: string, bgColor: string) => void;
  deleteSticky: (id: string) => void;
  setStickies: (stickies: TStickyNote[]) => void;
};
