const User = require("../models/User");

// Store active socket connections
const userSockets = new Map();

exports.initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // User joins their personal room when they connect
    socket.on("join-user-room", (userId) => {
      if (!userId) {
        console.log("No userId provided");
        return;
      }

      socket.join(`user:${userId}`);
      
      // Store socket connection
      if (!userSockets.has(userId)) {
        userSockets.set(userId, []);
      }
      userSockets.get(userId).push(socket.id);

      console.log(`User ${userId} joined room user:${userId} with socket ${socket.id}`);

      // Notify user they're connected
      socket.emit("connected", {
        message: "Successfully connected to real-time updates",
        userId,
      });
    });

    // Volunteer joins rescue tracking room
    socket.on("join-rescue-room", (reportId) => {
      if (!reportId) {
        console.log("No reportId provided");
        return;
      }

      socket.join(`rescue:${reportId}`);
      console.log(`Socket ${socket.id} joined rescue room rescue:${reportId}`);

      socket.emit("rescue-room-joined", {
        message: "Joined rescue tracking room",
        reportId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      
      // Remove socket from all user tracking
      userSockets.forEach((sockets, userId) => {
        const index = sockets.indexOf(socket.id);
        if (index !== -1) {
          sockets.splice(index, 1);
          if (sockets.length === 0) {
            userSockets.delete(userId);
          }
        }
      });
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

// Helper: Emit rescue update to report creator
exports.emitRescueUpdate = (io, reporterId, reportId, updateData) => {
  io.to(`user:${reporterId}`).emit("rescue-update", {
    reportId,
    ...updateData,
    timestamp: new Date(),
  });
};

// Helper: Emit to all users tracking this rescue
exports.emitToRescueRoom = (io, reportId, eventName, data) => {
  io.to(`rescue:${reportId}`).emit(eventName, {
    reportId,
    ...data,
    timestamp: new Date(),
  });
};

// Helper: Get user's connected status
exports.isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).length > 0;
};

// Helper: Get all active users
exports.getActiveUsers = () => {
  return Array.from(userSockets.keys());
};
