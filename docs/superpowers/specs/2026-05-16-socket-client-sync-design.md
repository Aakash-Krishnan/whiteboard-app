# Socket.io Client Integration & Draw Sync — Design Spec

**Issue:** #26 (Connect Socket.io client and sync draw events)  
**Date:** 2026-05-16

---

## 1. Overview

Wire the frontend to the Socket.io server so that draw events from one user are relayed to all other users in the same room in real time. The socket connection is owned by a new `useSocket` hook. `HistoryManager` is extended with a socket emitter callback so it remains the single outbound dispatch point for draw events.

---

## 2. Room Join Strategy

For now, all users auto-join a hardcoded room `"room-1"` with:
- `userId`: `crypto.randomUUID()` generated once on mount, stored in a `useRef`
- `name`: hardcoded `"Guest"`

No join UI. This will be replaced by a lobby screen in a future issue.

---

## 3. Architecture

```
useSocket (hook)
  ├── creates socket → connects to http://localhost:3001
  ├── on mount → emits join-room { roomId: "room-1", userId, name: "Guest" }
  ├── registers emitter on historyManager.setSocketEmitter(fn)
  ├── listens for draw-event → addElement to canvasStore (bypass historyManager)
  ├── listens for undo → remove element from canvasStore.elements by elementId (skip if own userId)
  ├── listens for redo → push element back to canvasStore.elements (skip if own userId)
  └── on unmount → socket.disconnect(), historyManager.clearSocketEmitter()

HistoryManager
  └── execute(AddElementCommand) → after local commit → calls socketEmitter(element) if set

page.tsx
  └── calls useSocket() — one line, no props
```

---

## 4. HistoryManager Changes

Add to `HistoryManager`:

```ts
private socketEmitter: ((element: TElement) => void) | null = null;

setSocketEmitter(fn: (element: TElement) => void): void {
  this.socketEmitter = fn;
}

clearSocketEmitter(): void {
  this.socketEmitter = null;
}
```

In `execute()`, after running the command, if the command is an `AddElementCommand`, call `this.socketEmitter?.(element)`.

`AddElementCommand` needs to expose the element it committed so `HistoryManager` can pass it to the emitter. Add a `readonly element: TElement` public field to `AddElementCommand`.

---

## 5. useSocket Hook

```ts
// apps/web/hooks/useSocket.ts

export function useSocket(): void {
  const userIdRef = useRef(crypto.randomUUID());
  const addElement = useCanvasStore((state) => state.addElement);
  const setElements = useCanvasStore((state) => state.setElements); // new action needed

  useEffect(() => {
    const socket = io("http://localhost:3001");
    const userId = userIdRef.current;

    socket.emit("join-room", { roomId: "room-1", userId, name: "Guest" });

    // Register draw emitter on historyManager
    historyManager.setSocketEmitter((element) => {
      socket.emit("draw-event", { roomId: "room-1", userId, element });
    });

    // Incoming draw from another user
    socket.on("draw-event", ({ element }: { element: TElement }) => {
      addElement(element);
    });

    // Incoming undo — skip if it's our own (server broadcasts to all)
    socket.on("undo", ({ elementId, userId: fromUserId }: { elementId: string; userId: string }) => {
      if (fromUserId === userId) return;
      useCanvasStore.setState((state) => ({
        elements: state.elements.filter((el) => el.id !== elementId),
      }));
    });

    // Incoming redo — skip if it's our own
    socket.on("redo", ({ element, userId: fromUserId }: { element: TElement; userId: string }) => {
      if (fromUserId === userId) return;
      useCanvasStore.setState((state) => ({
        elements: [...state.elements, element],
      }));
    });

    // Sync canvas state when joining a room with existing elements
    socket.on("room-state", ({ elements }: { elements: TElement[] }) => {
      useCanvasStore.setState({ elements });
    });

    return () => {
      socket.disconnect();
      historyManager.clearSocketEmitter();
    };
  }, [addElement]);
}
```

---

## 6. canvasStore Changes

Add a `setElements` action to replace the entire elements array (needed for `room-state` sync on join):

```ts
setElements: (elements: TElement[]) => set({ elements }),
```

Also add it to `TCanvasActions` type in `apps/web/types/canvasStore.ts`.

---

## 7. Echo Prevention

- **draw-event**: Server uses `socket.to(roomId)` — sender never receives its own draw back. No client-side check needed.
- **undo/redo**: Server uses `io.to(roomId)` (all clients including sender). Client checks `fromUserId === userId` and skips if own.

---

## 8. Dependencies

Install `socket.io-client` in the web app:

```bash
pnpm add socket.io-client --filter=web
```

---

## 9. Files Changed

| File | Action |
|---|---|
| `apps/web/hooks/useSocket.ts` | Create |
| `apps/web/hooks/useDrawing.ts` | No change needed |
| `apps/web/history/HistoryManager.ts` | Add `setSocketEmitter`, `clearSocketEmitter`, call emitter in `execute` |
| `apps/web/history/commands/AddElementCommand.ts` | Expose `readonly element: TElement` |
| `apps/web/store/canvasStore.ts` | Add `setElements` action |
| `apps/web/types/canvasStore.ts` | Add `setElements` to `TCanvasActions` |
| `apps/web/app/page.tsx` | Call `useSocket()` |

---

## 10. Out of Scope

- Lobby / room join UI (future issue)
- Cursor sync (#27)
- Presence bar (#28)
- Reconnection handling
- Error states (server down, etc.)
