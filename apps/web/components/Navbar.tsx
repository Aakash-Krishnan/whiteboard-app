import { useState } from "react";
import type { UserInfo } from "@/hooks/useSocket";

const MAX_VISIBLE = 4;

const ROOM_ID = "room-1";

function Avatar({ user, border }: { user: UserInfo; border?: string }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 border-2"
      style={{ backgroundColor: user.color, borderColor: border ?? "rgba(255,255,255,0.2)" }}
      title={user.name}
    >
      {user.name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export function Navbar({ users }: { users: UserInfo[] }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const visible = users.slice(0, MAX_VISIBLE);
  const overflow = users.length - MAX_VISIBLE;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-3xl">
      <div className="flex items-center justify-between px-4 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
        {/* Left: app name */}
        <span className="text-white font-semibold text-sm tracking-wide">✏️ Whiteboard</span>

        {/* Center: room code */}
        <span className="text-xs text-white bg-white/20 px-3 py-1 rounded-full font-mono">
          {ROOM_ID}
        </span>

        {/* Right: avatar stack + dropdown */}
        <div
          className="relative flex items-center pb-3 -mb-3"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          {/* Overlapping avatars */}
          <div className="flex items-center">
            {visible.map((user, i) => (
              <div
                key={user.userId}
                className="-ml-2 first:ml-0"
                style={{ zIndex: MAX_VISIBLE - i }}
              >
                <Avatar user={user} />
              </div>
            ))}
            {overflow > 0 && (
              <div
                className="-ml-2 w-7 h-7 rounded-full flex items-center justify-center text-white/60 text-[10px] font-semibold bg-white/20 border-2 border-white/10 shrink-0"
                style={{ zIndex: 0 }}
              >
                +{overflow}
              </div>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && users.length > 0 && (
            <div className="absolute top-full right-0 min-w-[160px] bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-2 flex flex-col gap-1">
              {users.map((user) => (
                <div key={user.userId} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10">
                  <Avatar user={user} border="rgba(255,255,255,0.3)" />
                  <span className="text-white text-xs">{user.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
