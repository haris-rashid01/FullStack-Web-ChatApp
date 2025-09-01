import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
const groupMembers = {};

export function getRecieverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  const userId = socket.handshake.query.userId;
  const fullName = socket.handshake.query.fullName;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("newMessage", ({ receiverId, message }) => {
    const receiverSocketId = getRecieverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        senderId: userId,
        message,
      });
    }
  });

  socket.on("joinGroups", (groupIds) => {
    groupIds.forEach((groupId) => socket.join(groupId));
    console.log(`User ${fullName} joined groups: ${groupIds}`);
  });

  socket.on("joinGroup", ({ groupId }) => {
    socket.join(groupId);

    if (!groupMembers[groupId]) groupMembers[groupId] = [];
    if (!groupMembers[groupId].includes(userId)) {
      groupMembers[groupId].push(userId);
    }

    console.log(`User ${fullName} joined group ${groupId}`);

    io.to(groupId).emit("groupNotification", {
      message: `User ${userId} joined the group`,
      groupId,
    });
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    if (groupMembers[groupId]) {
      groupMembers[groupId] = groupMembers[groupId].filter(
        (id) => id !== userId
      );
    }
    console.log(`User ${userId} left group ${groupId}`);
  });

  socket.on("groupMessage", ({ groupId, message }) => {
    io.to(groupId).emit("receiveGroupMessage", {
      senderId: userId,
      groupId,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
