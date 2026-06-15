const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const shelterRoutes = require("./routes/shelterRoutes");
const { initializeSocket } = require("./socket/socketManager");

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  transports: ["websocket", "polling"],
});

// Make io accessible to routes
app.set("io", io);

app.use(cors());
app.use(express.json());

// Initialize socket connections
initializeSocket(io);

app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/shelters", shelterRoutes);

app.get("/", (req, res) => {
  res.send("PAWFECT API running");
});

// Socket.io health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    activeConnections: io.engine.clientsCount,
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(process.env.PORT || 2002, () => {
      console.log(`Server running on port ${process.env.PORT || 2002}`);
      console.log("Socket.io initialized and ready for connections");
    });
  })
  .catch((err) => console.log(err));

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});