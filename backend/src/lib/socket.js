import { Server } from "socket.io";
import http from "http";
import express from "express";
import socketUtils from "./socketUtils.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) socketUtils.addUserToSocketMap(userId, socket.id);
  io.emit("getOnlineUsers", Object.keys(socketUtils.userSocketMap));

  socket.on("markMessageAsSeen", ({ messageId, senderId }) => {
    socketUtils.emitMessageSeen(io, messageId, senderId);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) socketUtils.removeUserFromSocketMap(userId);
    io.emit("getOnlineUsers", Object.keys(socketUtils.userSocketMap));
  });
});

export { io, app, server };
