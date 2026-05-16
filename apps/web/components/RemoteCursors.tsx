import type { CursorInfo } from "@/hooks/useSocket";

export function RemoteCursors({ cursors }: { cursors: Record<string, CursorInfo> }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute flex items-center gap-1.5 -translate-y-1/2"
          style={{ left: cursor.x, top: cursor.y }}
        >
          {/* Dot — color is dynamic so backgroundColor stays inline */}
          <div
            className="w-3 h-3 rounded-full border-2 border-white shrink-0"
            style={{ backgroundColor: cursor.color }}
          />
          {/* Name pill — color is dynamic so backgroundColor stays inline */}
          <div
            className="text-white text-[11px] px-1.5 py-0.5 rounded-[10px] whitespace-nowrap select-none"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}
