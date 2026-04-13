# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Run all apps (frontend + backend)
pnpm dev:web          # Run only the Next.js frontend (port 3000)
pnpm dev:server       # Run only the Express backend

# Build
pnpm build            # Build all apps
pnpm build:web        # Build and start the web app

# Linting & Type Checking
pnpm lint             # Lint all packages
pnpm check-types      # Type-check all packages
pnpm format           # Format all files with Prettier
```

Turborepo caches build/lint/check-types outputs. Use `--filter=web` or `--filter=server` to target specific apps.

## Architecture

**Monorepo** managed by Turborepo + pnpm workspaces:

```
apps/web/      → Next.js 16 frontend (drawing canvas)
apps/server/   → Express 5 + Socket.IO backend (real-time sync, currently empty)
packages/
  types/       → Shared TypeScript types + TOOLS constant
  ui/          → Shared React component library
  eslint-config/        → Shared ESLint configs
  typescript-config/    → Shared tsconfig bases
```

## Frontend (`apps/web/`)

### Canvas

The app is a single fullscreen canvas at `app/page.tsx`. Drawing logic is split into two hooks:

- **`hooks/useCanvas.ts`** — HiDPI canvas setup, scales 2D context by `devicePixelRatio`, handles window resize
- **`hooks/useDrawing.ts`** — Mouse events (down/move/up/leave), builds strokes, calls `reDraw()` via `requestAnimationFrame`. Uses `useCanvasStore.getState()` (not subscriptions) inside event listeners to avoid stale closures.

### State (`store/canvasStore.ts`, Zustand)

Types are split into `TCanvasState` / `TCanvasActions` in `apps/web/types/canvasStore.ts`.

State: `strokes: TStroke[]`, `activeColor: string`, `activeTool: TTool`  
Actions: `addStroke`, `addPoint`, `setActiveColor`, `setActiveTool`

Always use **individual selectors** for actions — not destructuring the whole store — to avoid re-renders on every `addPoint` call (60/sec during drawing).

### Toolbar (Compound Component Pattern)

`components/Toolbar/` uses the compound component pattern:

```tsx
<Toolbar>                                          {/* reads Zustand, provides Context */}
  <Toolbar.ColorPicker />                          {/* <input type="color"> */}
  <Toolbar.Separator />                            {/* visual divider */}
  <Toolbar.Tool icon={<PenIcon />} tool={TOOLS.PENCIL} label="Pen" />
  <Toolbar.Tool icon={<EraserIcon />} tool={TOOLS.ERASER} label="Eraser" />
</Toolbar>
```

- `Toolbar` (index.tsx) — reads Zustand, wraps children in `ToolBarContext.Provider`
- `Toolbar.Tool` / `Toolbar.ColorPicker` / `Toolbar.Separator` — read from context via `useToolBar()` hook (`hooks/context/useToolbar.ts`), never directly from Zustand

### Shared Types (`packages/types/`)

```typescript
TOOLS        { PENCIL: "pencil", ERASER: "eraser" }   // in constants/global.ts
TTool        derived: (typeof TOOLS)[keyof typeof TOOLS]
TPoint       { x, y }
TStroke      { path: TPoint[]; color?: string; tool: TTool }
TUser        { id, name, cursorColor }
```

`TOOLS` and `TTool` live in `packages/types` (not the web app) so the backend can share them.

## Tooling Notes

- **Path alias**: `@/*` maps to `apps/web/` root
- **ESLint**: `--max-warnings 0` enforced; all warnings are errors
- **Pre-commit hooks**: Husky runs `turbo lint --filter=...[HEAD~1]` — only changed packages are linted
- **Unused variables**: prefix with `_` to satisfy `@typescript-eslint/no-unused-vars` for intentional stubs
- **Node**: Requires ≥18
