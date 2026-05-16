import { create } from "zustand";
import type { TStickyNote } from "@whiteboard/types";
import type { TStickyActions, TStickyState } from "@/types/stickyStore";

export const useStickyStore = create<TStickyState & TStickyActions>((set) => ({
  stickies: [],
  addSticky: (sticky: TStickyNote) =>
    set((state) => ({ stickies: [...state.stickies, sticky] })),
  moveSticky: (id: string, x: number, y: number) =>
    set((state) => ({
      stickies: state.stickies.map((s) => (s.id === id ? { ...s, x, y } : s)),
    })),
  editSticky: (id: string, text: string) =>
    set((state) => ({
      stickies: state.stickies.map((s) => (s.id === id ? { ...s, text } : s)),
    })),
  colorSticky: (id: string, bgColor: string) =>
    set((state) => ({
      stickies: state.stickies.map((s) => (s.id === id ? { ...s, bgColor } : s)),
    })),
  deleteSticky: (id: string) =>
    set((state) => ({ stickies: state.stickies.filter((s) => s.id !== id) })),
  setStickies: (stickies: TStickyNote[]) => set({ stickies }),
}));
