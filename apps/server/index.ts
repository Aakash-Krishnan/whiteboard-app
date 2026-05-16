// apps/server/index.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerJoinRoom } from "./handlers/joinRoom.js";
import { registerDrawEvent } from "./handlers/drawEvent.js";
import { registerUndo } from "./handlers/undo.js";
import { registerRedo } from "./handlers/redo.js";
import { registerCursorMove } from "./handlers/cursorMove.js";
import { registerDisconnect } from "./handlers/disconnect.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  registerJoinRoom(io, socket);
  registerDrawEvent(io, socket);
  registerUndo(io, socket);
  registerRedo(io, socket);
  registerCursorMove(io, socket);
  registerDisconnect(io, socket);
});

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
