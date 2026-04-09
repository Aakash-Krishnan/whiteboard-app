# Whiteboard App — Full Chat Export

> This export covers two sessions. Session 1 is reconstructed from a summary. Session 2 is the live continuation.

---

## SESSION 1 — Project Setup & Canvas Basics

### Project Goal
Build a collaborative whiteboard app to master frontend development for top company interviews. Tech stack decided: Next.js 16 + React 19, Express 5 + Socket.io, Turborepo monorepo with pnpm workspaces, Tailwind, ShadCN, Zustand.

---

**User:** So I'm in a path of mastering Frontend with latest tools/framework. I'm planning to build a collaborative whiteboard...

**Assistant:** Outlined the full stack: Next.js 16 (frontend), Express 5 + Socket.io (backend), Turborepo monorepo, Zustand for state, and a 6-week project plan.

---

**User:** Can we go with Nextjs 16, ShadCn, tailwind. What do you think?

**Assistant:** Yes — all three are solid choices and commonly expected in top company interviews.

---

**User:** Do we need authentication and authorisation and Payments, or can we build this in v2?

**Assistant:** Defer to v2. Focus the MVP on the collaborative canvas itself. Auth and payments are distractions from learning the hard parts.

---

**User:** So can we use a monorepo concept here for the BE and frontend, or what is new?

**Assistant:** Yes — Turborepo with pnpm workspaces. This is the modern approach. Gives you shared packages (`@whiteboard/types`, `@whiteboard/eslint-config`, `@whiteboard/typescript-config`) that both the frontend and backend import.

---

### GitHub Setup & Issue Board

Created 34 GitHub issues across the project backlog. Key P1 issues for Week 1:

- #1 Init Turborepo monorepo
- #2 Configure shared packages
- #3 Scaffold Next.js app
- #4 Scaffold Express server
- #5 Configure ESLint + TypeScript
- #6 Build HiDPI canvas (`useCanvas`)
- #7 Mouse + touch event normalisation (`useDrawing`)
- #8 Build `redraw(elements)` render loop
- #9 Set up Zustand store
- #10 Build Toolbar component

**Errors fixed during setup:**
- `zsh: event not found: /bin/bash` — shebang in zsh triggers history expansion. Fix: remove shebang, use `bash <(pbpaste)`
- `unknown flag: --json` in gh CLI — gh v2.89.0 doesn't support `--json` for `gh issue create`. Removed that flag.
- All 34 issues "resource not found" — `--json` caused silent failure. Fixed with new script.
- `@repo/` naming — All packages used `@repo/` prefix. Fixed with `find ... -exec sed -i '' 's/@repo\//@whiteboard\//g' {} +`
- Nested `.git` in `apps/web` — create-next-app initialised git inside apps/web. Fixed: `rm -rf apps/web/.git`

---

### Shared Types (`packages/types/index.ts`)

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

**Key learning:** `package.json` for a shared internal package needs `"exports": { ".": "./index.ts" }` so TypeScript can resolve it across the monorepo.

---

### Canvas Basics — What Claude Taught

**How Canvas works:**
- `<canvas>` is like an `<img>` — just pixels. No DOM elements inside it.
- You draw on it using a 2D context: `canvas.getContext("2d")`
- Basic shapes: `fillRect`, `arc`, `beginPath`, `moveTo`, `lineTo`, `stroke`

**HiDPI / devicePixelRatio problem:**
- On retina screens, the canvas drawing surface needs to be 2x the CSS size
- Without correction: blurry lines
- Fix: multiply canvas width/height by `window.devicePixelRatio`, then `ctx.scale(dpr, dpr)`, then set CSS size to the original dimensions

**`useRef` vs `useState`:**
- `useState` triggers a re-render every time it changes
- `useRef` holds a mutable value that persists without causing re-renders
- Rule: use `useRef` for values that change frequently but don't affect what's displayed (like `isDrawing`, `lastX`, `lastY`)

---

### Issue #6 Complete — `useCanvas` Hook

```ts
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

---

### Issue #7 Complete — `useDrawing` Hook

**Key problem:** Raw `clientX/Y` are viewport coordinates. Canvas might be offset. Must subtract `getBoundingClientRect()` to get canvas-relative coordinates.

```ts
function getRect(canvas: HTMLCanvasElement, e: MouseEvent): TPoint {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
```

**Why `isDrawing` is a `useRef` not `useState`:**  
Mouse events fire 60+ times/second. Each `setState` call causes a re-render. Using `useRef` avoids all those re-renders — the value updates but the component doesn't re-render.

---

## SESSION 2 — Redraw Loop, Zustand, Toolbar

---

**User:** I'm not sure about this stroke getting darker and thicker — I drew a very big stroke doing circling and everything but it looks same to me.

**Assistant:** You're right — with solid opaque black, you won't see it. The darkening effect only shows with transparent strokes. But the real problem is structural: every `mousemove` re-strokes the **entire** path from `beginPath()`, not just the new segment. That's O(n²) total work. And the bigger issue: resize the window — everything disappears. The canvas is just pixels with no memory of what was drawn.

---

**User:** So what should I do now? Do I need to implement the 2 canvas and rAF or what?

**Assistant:** You already added `rAF` yourself — `cancelAnimationFrame(rafId)` + `requestAnimationFrame(...)` in `handleMouseMove`. That's the critical optimisation. The two-canvas approach is a future upgrade. First close issues #7 and #8, then clean up test shapes from `page.tsx`.

---

**User:** Before moving I want to add something — this project is just for learning. So can we somehow add most of the hooks from React, React patterns, Next.js patterns and JS patterns?

**Assistant:** Great idea. Mapped out the full learning plan:

**React Hooks to cover:**
- `useReducer` — implement canvas state as reducer before Zustand, to feel why Zustand exists
- `useCallback` / `useMemo` — memoising `reDraw` and derived state
- `useContext` — sharing canvas state without prop drilling
- `useLayoutEffect` — replacing `useEffect` in `useCanvas` (DOM measurements before paint)
- `useTransition` — toolbar updates shouldn't block drawing
- `useDeferredValue` — deferring remote users list during heavy drawing
- `useImperativeHandle` + `forwardRef` — exposing `canvas.clear()` to parent
- `useDebugValue` — meaningful DevTools labels in custom hooks
- `useSyncExternalStore` — understanding how Zustand works internally

**React Patterns:**
- Compound components — Toolbar (`<Toolbar><Toolbar.Tool /></Toolbar>`)
- Context + Provider
- Error Boundary
- Portals — remote user cursors
- `memo` — preventing toolbar re-renders during drawing
- `forwardRef`

**JS Patterns:**
- Command pattern — undo/redo (each stroke is a Command with `execute()` / `undo()`)
- Strategy pattern — switching tools (pen, eraser, shapes)
- Observer pattern — what Socket.io is under the hood
- Factory pattern — creating shape objects

**Next.js Patterns:**
- Server vs Client components
- Route handlers — saving/loading boards
- Server Actions — auto-saving
- `loading.tsx` / `error.tsx`
- Dynamic imports

---

### Issue #8 Complete — Redraw Loop

**Why you need a strokes array:**  
Canvas is just pixels. Resize the window → everything disappears. No way to undo, no way to send to another user. You need data.

**Data structure:**
```ts
// Not a flat array — you need structure
// Each stroke is an object so you can attach metadata later
type TStroke = {
  path: TPoint[];  // array of points
  color?: string;  // metadata
}

// Canvas state is an array of strokes
TStroke[]
```

**`reDraw` function:**
```ts
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
```

**`requestAnimationFrame` — why it matters:**
- `mousemove` can fire multiple times between screen refreshes
- Without rAF: 3 redraws per frame, user only sees 1
- With rAF: `cancelAnimationFrame` + `requestAnimationFrame` ensures exactly 1 redraw per screen refresh, in sync with the browser's paint cycle

**rAF is NOT the same as FPS:**  
`mousemove` fires based on how fast the mouse moves and the browser's polling rate. `requestAnimationFrame` fires exactly once per screen refresh (tied to display Hz). They're independent — rAF synchronises rendering with the display.

---

### Issue #9 Complete — Zustand Store

**Why `strokes` can't stay in `useDrawing` forever:**  
Prop drilling. An Undo button in a Toolbar can't reach `strokes` that lives inside `useDrawing`. You'd have to pass it through every component between them. Zustand lives outside the component tree — any component reads/writes directly.

**`canvasStore.ts`:**
```ts
export const useCanvasStore = create<TCanvasState & TCanvasActions>((set) => ({
  strokes: [],
  activeColor: "#000000",
  activeTool: TOOLS.PENCIL,
  addStroke: (stroke: TStroke) =>
    set((state) => ({ strokes: [...state.strokes, stroke] })),
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

**Key lessons learned:**

1. **Immutability** — Never `.push()` into state directly. Zustand can't detect the change (same reference). Always return new arrays/objects:
   ```ts
   // ❌ Wrong
   lastStroke.path.push(point);
   
   // ✅ Right
   { ...stroke, path: [...stroke.path, point] }
   ```

2. **Selectors — avoid subscribing to the whole store:**
   ```ts
   // ❌ Causes re-render on every addPoint call
   const { addStroke, addPoint } = useCanvasStore((state) => state);
   
   // ✅ Actions are stable refs — zero re-renders
   const addStroke = useCanvasStore((state) => state.addStroke);
   const addPoint = useCanvasStore((state) => state.addPoint);
   ```

3. **`getState()` for event handlers** — Event listeners close over initial values (stale closure). Use `useCanvasStore.getState().strokes` inside handlers to always get the latest state without subscribing:
   ```ts
   rafId = requestAnimationFrame(() =>
     reDraw(ctx, useCanvasStore.getState().strokes)
   );
   ```

4. **Deriving types from values (TypeScript pattern):**
   ```ts
   export const TOOLS = {
     PENCIL: "pencil",
     ERASER: "eraser",
   } as const;
   
   // TTool = "pencil" | "eraser" — auto-updates when TOOLS grows
   export type TTool = (typeof TOOLS)[keyof typeof TOOLS];
   ```

5. **Separating `TCanvasState` and `TCanvasActions`** — recommended Zustand pattern for larger stores. State holds data, Actions hold functions.

---

### In Progress — Toolbar (Compound Component Pattern)

**Pattern being implemented:**
```tsx
<Toolbar>
  <Toolbar.ColorPicker />
  <Toolbar.Separator />
  <Toolbar.Tool icon={PenIcon} tool="pen" />
  <Toolbar.Tool icon={EraserIcon} tool="eraser" />
</Toolbar>
```

**How compound components work:**
- Parent (`Toolbar`) creates a React Context
- Children (`Toolbar.Tool`) consume that context automatically — no prop passing
- Pattern is used widely: Radix UI, ShadCN, React Select
- `Toolbar` reads `activeTool` from Zustand, passes it via context to children
- `Toolbar.Tool` reads context to decide if it's highlighted

**Architecture decision:** `activeTool` lives in Zustand (not just toolbar context) because `useDrawing` needs to know which tool is active to decide whether to draw or erase.

**Toolbar skeleton:**
```ts
const ToolbarContext = createContext<TToolbarContext | null>(null);

function useToolbarContext() {
  const ctx = useContext(ToolbarContext);
  if (!ctx) throw new Error("useToolbarContext must be used within <Toolbar>");
  return ctx;
}

function Toolbar({ children }) { ... }
Toolbar.Tool = function Tool({ ... }) { ... }
Toolbar.Separator = function Separator() { ... }
```

---

## Current Status

| Issue | Status |
|-------|--------|
| #1 Init Turborepo | ✅ Done |
| #2 Shared packages | ✅ Done |
| #3 Scaffold Next.js | ✅ Done |
| #4 Scaffold Express | ✅ Done |
| #5 ESLint + TS config | ✅ Done |
| #6 useCanvas (HiDPI) | ✅ Done |
| #7 useDrawing (mouse events) | ✅ Done |
| #8 Redraw loop + rAF | ✅ Done |
| #9 Zustand store | ✅ Done |
| #10 Toolbar component | 🔄 In Progress |

---

*Exported from Cowork session — whiteboard-app project*
