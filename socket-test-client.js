#!/usr/bin/env node

/**
 * Socket.io Test Client for Pawfect Backend
 * 
 * This client helps test real-time rescue tracking without a frontend.
 * 
 * Installation:
 * npm install socket.io-client
 * 
 * Usage:
 * node socket-test-client.js
 */

const io = require("socket.io-client");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

class PawfectTestClient {
  constructor(url = "http://localhost:2002") {
    this.url = url;
    this.socket = null;
    this.userId = null;
    this.reportId = null;
  }

  connect() {
    console.log(`${colors.blue}[TEST] Connecting to ${this.url}${colors.reset}`);
    
    this.socket = io(this.url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on("connect", () => {
      console.log(`${colors.green}[CONNECTED] Socket ID: ${this.socket.id}${colors.reset}`);
    });

    this.socket.on("connected", (data) => {
      console.log(`${colors.green}[AUTH] ${data.message}${colors.reset}`);
      this.userId = data.userId;
    });

    this.socket.on("rescue-update", (data) => {
      console.log(
        `${colors.cyan}[RESCUE UPDATE] ${JSON.stringify(data, null, 2)}${colors.reset}`
      );
    });

    this.socket.on("volunteer-assigned", (data) => {
      console.log(
        `${colors.yellow}[VOLUNTEER ASSIGNED] ${JSON.stringify(data, null, 2)}${colors.reset}`
      );
    });

    this.socket.on("rescue-status-update", (data) => {
      console.log(
        `${colors.cyan}[STATUS UPDATE] ${JSON.stringify(data, null, 2)}${colors.reset}`
      );
    });

    this.socket.on("animal-rescued", (data) => {
      console.log(
        `${colors.green}[ANIMAL RESCUED!] ${JSON.stringify(data, null, 2)}${colors.reset}`
      );
    });

    this.socket.on("animal-shelter-reached", (data) => {
      console.log(
        `${colors.green}[SHELTER REACHED] ${JSON.stringify(data, null, 2)}${colors.reset}`
      );
    });

    this.socket.on("rescue-room-joined", (data) => {
      console.log(
        `${colors.green}[ROOM JOINED] ${JSON.stringify(data, null, 2)}${colors.reset}`
      );
    });

    this.socket.on("disconnect", () => {
      console.log(`${colors.red}[DISCONNECTED]${colors.reset}`);
    });

    this.socket.on("error", (error) => {
      console.error(`${colors.red}[ERROR] ${error}${colors.reset}`);
    });
  }

  joinUserRoom(userId) {
    console.log(`${colors.blue}[TEST] Joining user room: ${userId}${colors.reset}`);
    this.userId = userId;
    this.socket.emit("join-user-room", userId);
  }

  joinRescueRoom(reportId) {
    console.log(`${colors.blue}[TEST] Joining rescue room: ${reportId}${colors.reset}`);
    this.reportId = reportId;
    this.socket.emit("join-rescue-room", reportId);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log(`${colors.yellow}[TEST] Disconnected${colors.reset}`);
    }
  }
}

// Example Usage
async function runTests() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════════════╗
║         PAWFECT BACKEND - SOCKET.IO REAL-TIME TEST CLIENT         ║
╚════════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  const client = new PawfectTestClient("http://localhost:2002");
  client.connect();

  // Wait for connection
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Example: Join as user
  const exampleUserId = "660d5f8e0a1b2c3d4e5f6g7h"; // Replace with actual user ID
  const exampleReportId = "660d5f8e0a1b2c3d4e5f6g8i"; // Replace with actual report ID

  client.joinUserRoom(exampleUserId);
  
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  client.joinRescueRoom(exampleReportId);

  // Listen for updates
  console.log(`${colors.yellow}
┌────────────────────────────────────────────────────────────────────┐
│ Listening for real-time updates...                                 │
│ Send updates via API using a different terminal:                   │
│                                                                    │
│ curl -X PUT http://localhost:2002/api/reports/{reportId}/rescue-status \
│   -H "Authorization: Bearer <token>" \
│   -H "Content-Type: application/json" \
│   -d '{                                                             │
│     "status": "en-route",                                          │
│     "note": "Volunteer reached location",                          │
│     "location": "Park Avenue, NYC"                                 │
│   }'                                                                │
└────────────────────────────────────────────────────────────────────┘${colors.reset}
`);

  // Keep connection open
  process.on("SIGINT", () => {
    console.log(`${colors.yellow}\n[TEST] Shutting down...${colors.reset}`);
    client.disconnect();
    process.exit(0);
  });
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = PawfectTestClient;
