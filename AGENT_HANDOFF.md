# Agent Handoff — Whiteboard App (Full Context)

This document is a complete handoff for another agent to continue working on this project. It contains: full project context, all current file contents, verbatim conversation history, all decisions and their reasoning, and exact next steps.

---

## 1. WHO IS THE USER

**Name:** Sky (Aakash-Krishnan)  
**GitHub:** https://github.com/Aakash-Krishnan/whiteboard-app  
**Goal:** Master frontend development to clear interviews at top companies (FAANG-level). Building a collaborative whiteboard app as the learning vehicle.

---

## 2. TEACHING PHILOSOPHY — CRITICAL

**DO NOT give code before the user asks for it.**

The user explicitly said: *"I feel like first I need to know how to draw and I need to see the actual issue and then coming up with this performance would be the right approach."*

The correct teaching flow is:
1. Ask a question that makes the user think
2. Let them answer (even if partially wrong)
3. Correct/confirm their answer with explanation
4. Only show code when they ask or have already tried writing it themselves
5. When they write code and show it for review — review it and point out issues one at a time, asking them to fix each one

**Learning goal expansion:** The user also said they want to cover as many React hooks, React patterns, Next.js patterns, and JS patterns as possible through this project. Every feature is an opportunity to introduce a new pattern.

---

## 3. TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.0 + React 19 |
| Styling | Tailwind CSS + ShadCN |
| State | Zustand |
| Backend | Express 5 + Socket.io |
| Monorepo | Turborepo + pnpm workspaces |
| Language | TypeScript throughout |
| Package manager | pnpm@9.0.0 |

---

## 4. MONOREPO STRUCTURE

```
white-board/                          ← root
├── apps/
│   ├── web/                          ← Next.js 16 frontend
│   └── server/                       ← Express 5 backend (empty index.ts)
├── packages/
│   ├── types/                        ← @whiteboard/types (shared TS types)
│   ├── typescript-config/            ← @whiteboard/typescript-config
│   ├── eslint-config/                ← @whiteboard/eslint-config
│   └── ui/                           ← @whiteboard/ui (ShadCN base, unused by server)
├── turbo.json
└── package.json
```

All internal packages use `@whiteboard/` prefix (NOT `@repo/` — that was an early bug, already fixed).

---

## 5. ALL CURRENT FILE CONTENTS

### `packages/types/index.ts`
```ts
export type TUser = {
  id: string;
  name: string;
  cursorColor: string;
};

export type TPoint = {
  x: number;
  y: number;
};

export type TStroke = {
  path: TPoint[];
  color?: string;
};
```

### `packages/types/package.json`
```json
{
  "name": "@whiteboard/types",
  "version": "0.0.1",
  "private": true,
  "exports": { ".": "./index.ts" }
}
```

---

### `apps/web/constants/global.ts`
```ts
export const TOOLS = {
  PENCIL: "pencil",
  ERASER: "eraser",
} as const;
```

### `apps/web/types/canvasStore.ts`
```ts
import { TOOLS } from "@/constants/global";
import { TPoint, TStroke } from "@whiteboard/types";

export type TTool = (typeof TOOLS)[keyof typeof TOOLS];

export type TCanvasState = {
  strokes: TStroke[];
  activeColor: string;
  activeTool: TTool;
};

export type TCanvasActions = {
  addStroke: (stroke: TStroke) => void;
  addPoint: (point: TPoint) => void;
  setActiveColor: (color: string) => void;
  setActiveTool: (tool: TTool) => void;
};
```

### `apps/web/store/canvasStore.ts`
```ts
import { TOOLS } from "@/constants/global";
import { TCanvasActions, TCanvasState, TTool } from "@/types/canvasStore";
import { TPoint, TStroke } from "@whiteboard/types";
import { create } from "zustand";

export const useCanvasStore = create<TCanvasState & TCanvasActions>((set) => ({
  strokes: [],
  activeColor: "#000000",
  activeTool: TOOLS.PENCIL,
  addStroke: (stroke: TStroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
    })),
  addPoint: (point: TPoint) =>
    set((state) => ({
      strokes: state.strokes.map((stroke, idx) =>
        idx === state.strokes.length - 1
          ? { ...stroke, path: [...stroke.path, point] }
          : stroke
      ),
    })),
  setActiveColor: (color: string) => set({ activeColor: color }),
  setActiveTool: (tool: TTool) => set({ activeTool: tool }),
}));
```

### `apps/web/hooks/useCanvas.ts`
```ts
import { useEffect, useRef } from "react";

/**
 * Manages a full-viewport canvas element with HiDPI support.
 * Automatically resizes on window resize and scales the 2D context
 * so drawing coordinates remain in CSS pixels.
 */
export function useCanvas(): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio;
      canvas.height = window.innerHeight * dpr;
      canvas.width = window.innerWidth * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return canvasRef;
}
```

### `apps/web/hooks/useDrawing.ts`
```ts
import { useEffect, useRef } from "react";
import { TPoint, TStroke } from "@whiteboard/types";
import { useCanvasStore } from "@/store/canvasStore";

function getRect(canvas: HTMLCanvasElement, e: MouseEvent): TPoint {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function reDraw(ctx: CanvasRenderingContext2D | null, strokes: TStroke[]) {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  strokes.forEach((stroke) => {
    ctx.strokeStyle = stroke.color ?? "rgba(0,0,0,1)";
    stroke.path.forEach((point, idx) => {
      if (idx === 0) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  });
}

export function useDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const addStroke = useCanvasStore((state) => state.addStroke);
  const addPoint = useCanvasStore((state) => state.addPoint);
  const { getState } = useCanvasStore;
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const { x, y } = getRect(canvas, e);
      addStroke({ path: [{ x, y }], color: getState().activeColor });
      reDraw(ctx, getState().strokes);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      isDrawing.current = false;
    };

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const { x, y } = getRect(canvas, e);
      addPoint({ x, y });
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => reDraw(ctx, getState().strokes));
    };

    const handleMouseLeave = (e: MouseEvent) => {
      e.preventDefault();
      isDrawing.current = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [canvasRef, addStroke, addPoint, getState]);
}
```

### `apps/web/app/page.tsx`
```tsx
"use client";

import { useCanvas } from "@/hooks/useCanvas";
import { useDrawing } from "@/hooks/useDrawing";

export default function Home() {
  const canvasRef = useCanvas();
  useDrawing(canvasRef as React.RefObject<HTMLCanvasElement | null>);

  return (
    <div className="home-page">
      <canvas
        className="bg-[rgba(0,0,0,0.4)]"
        ref={canvasRef}
        id="canvas"
        role="presentation"
      >
        This is a fallback
      </canvas>
    </div>
  );
}
```

### `apps/web/app/layout.tsx`
```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

### `apps/web/components/Toolbar/index.tsx` (IN PROGRESS)
```tsx
"use client";

import { TOOLS } from "@/constants/global";
import { TTool } from "@/types/canvasStore";
import React, { createContext, useState } from "react";

export type TToolBarContext = {
  activeTool: TTool;
  handleSetActiveTool: (tool: TTool) => void;
} | null;

export const ToolBarContext = createContext<TToolBarContext>(null);

export default function Toolbar({ children }: { children: React.ReactNode }) {
  const [activeTool, setActiveTool] = useState<TTool>(TOOLS.PENCIL);

  const handleSetActiveTool = (tool: TTool): void => {
    setActiveTool(tool);
  };

  return (
    <ToolBarContext.Provider value={{ activeTool, handleSetActiveTool }}>
      {children}
    </ToolBarContext.Provider>
  );
}
```

### `apps/web/components/Toolbar/ColorPicker.tsx` (IN PROGRESS — empty)
```tsx
import { useToolBar } from "@/hooks/context/useToolbar";
import React from "react";

export default function ColorPicker() {
  const { handleSetActiveTool, activeTool } = useToolBar();
  return <div></div>;
}
```

### `apps/web/hooks/context/useToolbar.ts`
```ts
import { ToolBarContext } from "@/components/Toolbar";
import { useContext } from "react";

export const useToolBar = () => {
  const context = useContext(ToolBarContext);
  if (!context) {
    throw new Error("useToolBar must be used within a Toolbar");
  }
  return context;
};
```

### `apps/server/index.ts`
```ts
// EMPTY — server not yet implemented
```

---

## 6. ISSUE STATUS

| # | Title | Status |
|---|-------|--------|
| #1 | Init Turborepo monorepo | ✅ Done |
| #2 | Configure shared packages (`@whiteboard/types`) | ✅ Done |
| #3 | Scaffold Next.js app | ✅ Done |
| #4 | Scaffold Express server | ✅ Done (empty) |
| #5 | Configure ESLint + TypeScript | ✅ Done |
| #6 | Build HiDPI canvas `useCanvas` | ✅ Done |
| #7 | Mouse + touch event normalisation `useDrawing` | ✅ Done |
| #8 | Build `redraw(elements)` render loop | ✅ Done |
| #9 | Set up Zustand store | ✅ Done |
| #10 | Build Toolbar component | 🔄 In Progress |

---

## 7. WHAT'S IN PROGRESS — TOOLBAR (Issue #10)

The user has started the Toolbar. Here is the issue being discussed at the point of handoff:

**The user used `useState` for `activeTool` inside the Toolbar component instead of reading it from Zustand.**

```tsx
// What the user wrote:
const [activeTool, setActiveTool] = useState<TTool>(TOOLS.PENCIL);
```

**This is a bug.** `activeTool` needs to come from the Zustand store because `useDrawing` reads `getState().activeTool` to decide whether to draw or erase. If `activeTool` is only in component state, changing the tool in the toolbar won't affect what `useDrawing` does.

**The correct approach:**
```tsx
import { useCanvasStore } from "@/store/canvasStore";

export default function Toolbar({ children }) {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);

  return (
    <ToolBarContext.Provider value={{ activeTool, handleSetActiveTool: setActiveTool }}>
      {children}
    </ToolBarContext.Provider>
  );
}
```

**How to teach this:** Ask the user "if you pick a colour in the toolbar, which component applies it to the next stroke?" The answer is `useDrawing` → `getState().activeTool`. But `getState()` reads from Zustand, not from component state. So the toolbar's `useState` and the store's `activeTool` are two different values that will immediately diverge.

---

## 8. COMPOUND COMPONENT PATTERN — WHAT'S BEEN EXPLAINED

The user understands this pattern conceptually. Here's what was explained:

```tsx
// Usage goal:
<Toolbar>
  <Toolbar.ColorPicker />
  <Toolbar.Separator />
  <Toolbar.Tool icon={PenIcon} tool="pencil" />
  <Toolbar.Tool icon={EraserIcon} tool="eraser" />
</Toolbar>
```

- `Toolbar` = parent, creates Context, reads Zustand, provides context to children
- `Toolbar.Tool` = child, reads from context, highlights if `tool === activeTool`, calls `setActiveTool` on click
- `Toolbar.Separator` = purely visual, no logic
- `Toolbar.ColorPicker` = child, calls `setActiveColor` from Zustand directly

The static property pattern for compound components:
```ts
function Toolbar() { ... }
Toolbar.Tool = function Tool() { ... }
Toolbar.Separator = function Separator() { ... }
export { Toolbar }
```

The user hasn't yet implemented `Toolbar.Tool` or `Toolbar.Separator` — only the parent `Toolbar` exists (with the useState bug above).

---

## 9. PATTERNS PLANNED FOR THIS PROJECT

The user explicitly asked to cover as many patterns as possible through building this app. Track which ones have been covered vs pending:

### React Hooks
| Hook | Status | Where |
|------|--------|-------|
| `useRef` | ✅ Used | `useDrawing` — `isDrawing`, `useCanvas` — `canvasRef` |
| `useEffect` | ✅ Used | `useCanvas`, `useDrawing` |
| `useState` | Pending | Toolbar local state |
| `useContext` | ✅ Used | `useToolBar` hook |
| `useCallback` | Pending | Memoising handlers |
| `useMemo` | Pending | Derived state (bounding boxes) |
| `useReducer` | Pending | Undo/redo — Command pattern |
| `useLayoutEffect` | Pending | Replace `useEffect` in `useCanvas` |
| `useTransition` | Pending | Toolbar updates |
| `useDeferredValue` | Pending | Remote users list |
| `useImperativeHandle` + `forwardRef` | Pending | `canvas.clear()`, `canvas.exportAsPNG()` |
| `useDebugValue` | Pending | Custom hooks DevTools labels |
| `useSyncExternalStore` | Pending | Understanding Zustand internals |

### React Patterns
| Pattern | Status | Where |
|---------|--------|-------|
| Compound components | 🔄 In Progress | Toolbar |
| Context + Provider | ✅ Used | ToolbarContext |
| `memo` | Pending | Toolbar (prevent re-renders during drawing) |
| `forwardRef` | Pending | Canvas component |
| Error Boundary | Pending | Wrap canvas |
| Portals | Pending | Remote user cursors |

### JS Patterns
| Pattern | Status | Where |
|---------|--------|-------|
| Command pattern | Pending | Undo/redo |
| Strategy pattern | Pending | Tool switching (pen/eraser/shapes) |
| Observer pattern | Pending | Socket.io (explain it IS the Observer pattern) |
| Factory pattern | Pending | Shape creation |

### Next.js Patterns
| Pattern | Status | Where |
|---------|--------|-------|
| Server vs Client components | ✅ Used | "use client" in page.tsx |
| Route handlers | Pending | Save/load boards |
| Server Actions | Pending | Auto-save |
| `loading.tsx` / `error.tsx` | Pending | App shell |
| Dynamic imports | Pending | Lazy canvas bundle |

---

## 10. KEY TECHNICAL DECISIONS & REASONING

### Why `useRef` not `useState` for `isDrawing`
`mousemove` fires 60+ times/second. `useState` causes a re-render on every change. `useRef` holds the value without triggering re-renders. Rule: use `useRef` for values that change frequently but don't affect what's rendered.

### Why `getState()` instead of subscribing to `strokes` in `useDrawing`
Event listeners close over the value of `strokes` at the time the `useEffect` runs (stale closure). `useCanvasStore.getState().strokes` always reads the current value from the store synchronously, bypassing the stale closure entirely.

### Why separate selectors for Zustand actions
```ts
// BAD — subscribes to whole store, re-renders on every addPoint call
const { addStroke, addPoint } = useCanvasStore((state) => state);

// GOOD — actions are stable refs, zero re-renders
const addStroke = useCanvasStore((state) => state.addStroke);
const addPoint = useCanvasStore((state) => state.addPoint);
```

### Why `TTool` is derived from `TOOLS` constant
```ts
export const TOOLS = { PENCIL: "pencil", ERASER: "eraser" } as const;
export type TTool = (typeof TOOLS)[keyof typeof TOOLS]; // "pencil" | "eraser"
```
Adding a new tool to `TOOLS` auto-updates `TTool`. No manual type maintenance.

### Why immutability matters in Zustand
Zustand detects changes by reference comparison. If you `.push()` into an existing array, the reference stays the same — Zustand sees no change, subscribers don't re-render.

### Why `requestAnimationFrame` in `mousemove`
`mousemove` can fire multiple times between screen refreshes. Without rAF, you call `reDraw` 3-5 times per frame but the user only sees 1 frame. `cancelAnimationFrame` + `requestAnimationFrame` ensures exactly 1 redraw per screen refresh.

### Why `strokes` is in Zustand not `useDrawing`
`useDrawing` owned `strokes` initially. But an Undo button in the Toolbar can't reach a `useRef` inside `useDrawing`. Any shared state needs to live outside the component tree — that's what Zustand provides.

---

## 11. VERBATIM CONVERSATION — SESSION 2 (CURRENT SESSION)

This session is a continuation. The previous session established the monorepo, all shared packages, the Canvas API basics, and completed issues #6 and #7.

---

**User:** I'm not sure about this stroke getting darker and thicker — I drew a very big stroke doing circling and everything but it looks same to me.

**Assistant:** You're right — with a solid default black stroke, you won't see it. The re-drawing is still happening, but since you're painting fully opaque black over fully opaque black, it looks identical. The effect becomes visible if the stroke had any transparency. But that's not the point to chase right now.

The actual problem worth understanding is this: every `mousemove` event re-strokes the entire path from `beginPath()` all the way to the current point. Not just the new segment — everything. So if you draw a 1000-point stroke, the last `mousemove` call is doing 1000x more work than the first one. That's O(n²) total work across a single stroke.

For now it feels fine because the canvas is fast. But this approach also has a bigger structural problem: Once you release the mouse, you have no memory of what was drawn. The canvas is just pixels. If you resize the window, everything disappears. If you want to let a second user see the same drawing, you have no data to send them. If you want undo, you have nothing to undo.

That's what issue #8 solves — instead of drawing directly into the canvas on every event, you: 1) Store each stroke as data, 2) Have a `redraw(elements)` function that clears the canvas and re-draws everything from that data.

Try this before we move on: resize your browser window while you have something drawn. What happens?

---

**User:** I can see the issue now. So I will be having an array where I will store this last x and y and on every move I will call this redraw where it will clear the whole canvas and loops to this array and do what?

**Assistant:** You're on the right track, but think one level deeper. You said "store last x and y" — but think about what a single drawing session looks like: 1) press mouse down → stroke begins, 2) move → 200 points, 3) release → stroke ends, 4) press down again → new stroke begins. So it's not just a flat array of points. If you just had [{x,y}, {x,y}, ...] with 300 points from 3 different strokes, how would redraw know where one stroke ends and the next begins?

---

**User:** So I need to have array of arrays where each array will be having x, y like [[[x,y], [x,y]]] right or does it have to be an object?

**Assistant:** Both work technically, but think about what happens later. Right now a stroke is just points. But soon you'll want a color, stroke width, tool type. With a flat array of arrays, where do you put metadata? With an object you just add properties: `{ points: [{x,y}], color: "#000", width: 2 }`. And you already have the `Point` type in `@whiteboard/types`. So the natural next step is adding a `Stroke` type right next to it. What would that type look like?

---

**User:** So this is going to be an array of objects?

**Assistant:** Yes. Each stroke is an object, and you store an array of those objects. `Stroke` type: `{ points: TPoint[], color?: string }`. Canvas state is `Stroke[]`. Lifecycle: mousedown → push new empty Stroke, mousemove → push {x,y} into last stroke's points, call redraw. `redraw(strokes)`: clearRect, loop strokes, for each: beginPath, moveTo first point, lineTo each subsequent, stroke. Where does the strokes array live — in `useDrawing`, in `page.tsx`, or somewhere else?

---

**User:** useDrawing?

**Assistant:** Good instinct, and it'll work as a starting point. But think about what `useDrawing` is responsible for — it handles mouse events and draws to the canvas. If it also owns the strokes array, it's doing two jobs. The problem shows up the moment you add the server. When a remote user sends their stroke over WebSocket, who receives it? Some other hook. That hook also needs to add to the strokes array and trigger a redraw. If strokes lives inside `useDrawing`, that other hook can't reach it. So strokes need to live outside both hooks — somewhere any part of the app can read from and write to. That's exactly what issue #9 (Zustand) is for. But build it in `useDrawing` first to get the redraw loop working.

---

**User:** I've done — can you check once

**Assistant:** *(reviewed `useDrawing.ts` — the store implementation was the next step, types were good)*

Good structure — separating `TCanvasState` and `TCanvasActions` into two types is actually a recommended Zustand pattern. Two things to fix: 1) `create` needs the generic type `create<TCanvasState & TCanvasActions>`, 2) The `set` functions are returning the wrong thing — `set((state) => stroke)` returns the stroke itself, not a partial state update.

---

*(Multiple iterations of the user fixing the store — addStroke, addPoint immutability issues, spread operator — each time the user showed the code and was asked to fix one thing at a time)*

---

**User:** "just a doubt we looping again and again for every pixel moved. So isn't this a performance issue. I mean for a small strokes this wont impact much but when we have like lets say a whole proper architecture drawn..."

**Assistant:** Explained two-canvas approach (Excalidraw pattern) and `requestAnimationFrame`. The user had already added `rAF` themselves (`cancelAnimationFrame(rafId)` + `requestAnimationFrame`). Explained that `mousemove` is not based on FPS — it fires based on mouse movement speed and browser polling rate, while `rAF` fires exactly once per screen refresh.

---

**User:** "is this `const { addStroke, addPoint } = useCanvasStore((state) => state);` different from `const addStroke = useCanvasStore((state) => state.addStroke);`?"

**Assistant:** Yes — the first subscribes to the whole store (re-renders on every `addPoint` call, which is 60/sec). The second subscribes only to stable function references that never change — zero re-renders. What matters is what the selector returns, not how you destructure it. Mentioned `useShallow` for when you need multiple values.

---

**User:** "Before moving I want to add something — this project is just for learning. Can we add most hooks from React and React patterns, Next.js patterns and JS patterns?"

**Assistant:** Mapped out full learning plan (see Section 9 above).

---

**User:** "okay I'm done with the activeTool" *(had implemented `TOOLS` constant with `as const`, `TTool` derived type, added `activeTool`/`setActiveTool` to store)*

**Assistant:** Highlighted the `TTool = (typeof TOOLS)[keyof typeof TOOLS]` pattern — deriving types from values. Explained: `typeof TOOLS` → the object type, `keyof typeof TOOLS` → union of keys, indexed access gives union of values. Adding a new tool auto-updates the type.

---

**User:** "can you export this whole chat?" then "see basically I need this exported file to share it with other agents like Claude Code. So that agent needs to know everything that happened here. So don't just summarise."

**Assistant:** Reading all files and writing this full handoff document.

---

## 12. NEXT STEPS FOR INCOMING AGENT

### Immediate — Fix Toolbar's `useState` bug (still in current session)
The Toolbar uses `useState` for `activeTool` but it should read from Zustand. The user needs to understand WHY first (teaching approach). Ask: "If you pick a tool in the Toolbar, which part of the code actually uses that tool to draw?" Answer: `useDrawing` → `getState().activeTool`. But that reads from Zustand, not from local component state. So the local state and the store are disconnected.

### After fix — Complete the Compound Component pattern
User needs to add:
1. `Toolbar.Tool` component — reads `activeTool` from ToolbarContext, highlights if active, calls `handleSetActiveTool` on click. Props: `{ icon: React.ComponentType, tool: TTool, label: string }`
2. `Toolbar.Separator` — purely visual `<div>` with a divider line
3. `Toolbar.ColorPicker` — currently empty. Should show a color swatch or `<input type="color">`, calls `setActiveColor` from Zustand directly

### Then — Wire Toolbar into `page.tsx`
```tsx
<Toolbar>
  <Toolbar.Tool icon={PenIcon} tool={TOOLS.PENCIL} label="Pen" />
  <Toolbar.Tool icon={EraserIcon} tool={TOOLS.ERASER} label="Eraser" />
  <Toolbar.Separator />
  <Toolbar.ColorPicker />
</Toolbar>
```

### Then — Hook `activeTool` into `useDrawing`
Currently `useDrawing` always draws. When `activeTool === TOOLS.ERASER`, it should use `ctx.globalCompositeOperation = "destination-out"` to erase instead of draw. This is the **Strategy pattern** — the tool determines the drawing behaviour.

### Upcoming Issues
- `useLayoutEffect` — replace `useEffect` in `useCanvas` (measuring DOM before paint)
- `useCallback` — memoize handlers in Toolbar.Tool
- `memo` — wrap Toolbar in `React.memo` to prevent re-renders during drawing
- `forwardRef` + `useImperativeHandle` — expose `canvas.exportAsPNG()` 
- Undo/redo with `useReducer` (Command pattern)
- Server side: `apps/server/index.ts` is empty — needs Express + Socket.io setup
- Remote cursors via Portals

---

## 13. ERRORS FIXED IN SESSION 1 (FOR CONTEXT)

| Error | Fix |
|-------|-----|
| `zsh: event not found: /bin/bash` | Remove shebang, use `bash <(pbpaste)` |
| `gh issue create --json url` unknown flag | Remove `--json url --jq '.url'` from gh command |
| All 34 issues "resource not found" | `--json` flag caused silent failure in issue creation script |
| `@repo/` prefix instead of `@whiteboard/` | `find ... -exec sed -i '' 's/@repo\//@whiteboard\//g' {} +` |
| Nested `.git` in `apps/web` | `rm -rf apps/web/.git` |
| `@whiteboard/ui` in server deps | Removed — server has no UI |
| Missing `eslint.config.js` in `apps/server` | Added: `import { config } from "@whiteboard/eslint-config/base"; export default config;` |
| `mousedown` using raw `clientX/Y` | Fixed: use same `getRect()` helper as `mousemove` |
| `strokesRef` pattern for stale closure | Replaced with `useCanvasStore.getState()` |
| `create<TCanvasState, TCanvasActions>` wrong generic | Fixed: `create<TCanvasState & TCanvasActions>` |
| `lastStroke.path.push(point)` mutation in store | Fixed: `{ ...stroke, path: [...stroke.path, point] }` |
| Missing `...stroke` spread in `addPoint` | Fixed: spread existing stroke before overriding path |
| Color opacity 0.1 making strokes invisible | Fixed: `rgba(0,0,0,1)` |
| Naming collision `stroke.forEach((stroke) =>` | Fixed: parameter renamed to `strokes` |

---

*This document was generated during the Cowork session on 2026-04-09.*
*GitHub repo: https://github.com/Aakash-Krishnan/whiteboard-app*
