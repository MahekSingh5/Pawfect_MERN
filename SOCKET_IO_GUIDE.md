# Socket.io Real-Time Rescue Tracking - Implementation Guide

## Overview

Pawfect Backend now has **real-time rescue tracking** using Socket.io. Instead of users polling the API every few seconds, they get instant updates when rescue status changes.

## Architecture

### Before Socket.io
```
Report Created
    ↓
Volunteer Accepts (DB Update)
    ↓
User refreshes page (polls API)
    ↓
Sees updated status
```
**Problem**: User has no idea what's happening until they refresh.

### After Socket.io
```
Report Created
    ↓
Volunteer Accepts
    ↓ 
INSTANT: WebSocket Event Sent
    ↓
User sees real-time update
```
**Solution**: Instant push notifications without polling.

---

## Real-Time Rescue Status Flow

### Status States
```
pending → assigned → en-route → rescued → shelter-reached → closed
```

Each transition triggers a real-time event.

### Events Emitted

#### 1. Volunteer Assigned
```javascript
socket.on("volunteer-assigned", {
  reportId: "...",
  volunteer: { ... },
  status: "assigned"
});
```

#### 2. Rescue Status Updates
```javascript
socket.on("rescue-status-update", {
  reportId: "...",
  status: "en-route",
  note: "Reached Park Avenue",
  location: "Park Avenue, NYC",
  volunteerId: "...",
  volunteerName: "John Doe"
});
```

#### 3. Animal Rescued
```javascript
socket.on("animal-rescued", {
  reportId: "...",
  animalType: "Dog",
  message: "Animal has been rescued!"
});
```

#### 4. Shelter Reached
```javascript
socket.on("animal-shelter-reached", {
  reportId: "...",
  animalType: "Dog",
  message: "Animal has reached the shelter"
});
```

---

## Using Socket.io on Frontend

### Installation
```bash
npm install socket.io-client
```

### React Example

```jsx
import { useEffect, useState } from "react";
import io from "socket.io-client";

function RescueTracker({ reportId, userId }) {
  const [updates, setUpdates] = useState([]);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    // Connect to server
    const socket = io("http://localhost:2002", {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    // Join user-specific room for updates
    socket.emit("join-user-room", userId);

    // Join rescue tracking room
    socket.emit("join-rescue-room", reportId);

    // Listen for rescue updates
    socket.on("rescue-status-update", (data) => {
      setStatus(data.status);
      setUpdates((prev) => [data, ...prev]);
    });

    socket.on("animal-rescued", (data) => {
      console.log("🎉 Animal rescued!", data);
      setStatus("rescued");
    });

    return () => socket.disconnect();
  }, [reportId, userId]);

  return (
    <div>
      <h2>Rescue Status: {status}</h2>
      <div>
        {updates.map((update, i) => (
          <div key={i}>
            <p>{update.note}</p>
            <small>{new Date(update.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RescueTracker;
```

### Vue Example

```vue
<template>
  <div>
    <h2>Rescue Status: {{ status }}</h2>
    <div v-for="(update, i) in updates" :key="i">
      <p>{{ update.note }}</p>
      <small>{{ formatTime(update.timestamp) }}</small>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import { ref, onMounted, onBeforeUnmount } from "vue";

export default {
  props: ["reportId", "userId"],
  setup(props) {
    const updates = ref([]);
    const status = ref("pending");
    let socket;

    onMounted(() => {
      socket = io("http://localhost:2002");
      socket.emit("join-user-room", props.userId);
      socket.emit("join-rescue-room", props.reportId);

      socket.on("rescue-status-update", (data) => {
        status.value = data.status;
        updates.value.unshift(data);
      });

      socket.on("animal-rescued", (data) => {
        status.value = "rescued";
      });
    });

    onBeforeUnmount(() => {
      socket?.disconnect();
    });

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString();
    };

    return { updates, status, formatTime };
  },
};
</script>
```

---

## Backend API Endpoints

### Update Rescue Status
```http
PUT /api/reports/{reportId}/rescue-status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "en-route",
  "note": "Volunteer reached location",
  "location": "Park Avenue, NYC"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rescue status updated to en-route",
  "report": { ... },
  "rescueUpdate": {
    "_id": "...",
    "report": "...",
    "volunteer": "...",
    "status": "en-route",
    "note": "Volunteer reached location",
    "location": "Park Avenue, NYC",
    "createdAt": "2024-06-15T10:30:00Z"
  }
}
```

### Get Rescue Timeline
```http
GET /api/reports/{reportId}/timeline
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "timeline": [
    {
      "_id": "...",
      "report": "...",
      "volunteer": { ... },
      "status": "assigned",
      "note": "Volunteer assigned to rescue mission",
      "createdAt": "2024-06-15T09:00:00Z"
    },
    {
      "_id": "...",
      "status": "en-route",
      "note": "Volunteer reached location",
      "createdAt": "2024-06-15T09:15:00Z"
    },
    {
      "_id": "...",
      "status": "rescued",
      "note": "Animal successfully rescued",
      "createdAt": "2024-06-15T09:45:00Z"
    }
  ]
}
```

---

## Testing Without Frontend

### Using Socket.io Test Client

```bash
# Install socket.io-client first
npm install socket.io-client

# Run test client
node socket-test-client.js
```

The test client will:
1. Connect to your server
2. Join user rooms
3. Display all incoming events
4. Show real-time updates

### Using cURL + Postman + Test Client

**Terminal 1** - Start server:
```bash
npm run dev
```

**Terminal 2** - Run Socket.io test client:
```bash
node socket-test-client.js
```

**Terminal 3** - Send updates:
```bash
# First, get your token
TOKEN=$(curl -X POST http://localhost:2002/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}' \
  | jq -r '.token')

# Update rescue status
curl -X PUT http://localhost:2002/api/reports/{reportId}/rescue-status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "en-route",
    "note": "Volunteer reached location",
    "location": "Park Avenue, NYC"
  }'
```

**Terminal 2** will display the real-time event!

---

## Database Models

### Report (Updated)
```javascript
{
  _id: ObjectId,
  animalType: String,
  location: String,
  description: String,
  contactNumber: String,
  image: String,
  reportedBy: ObjectId (User),
  assignedVolunteer: ObjectId (VolunteerProfile),
  status: "pending" | "assigned" | "en-route" | "rescued" | "shelter-reached" | "closed",
  lastUpdateNote: String,
  createdAt: Date,
  updatedAt: Date
}
```

### RescueUpdate (New)
```javascript
{
  _id: ObjectId,
  report: ObjectId (Report),
  volunteer: ObjectId (VolunteerProfile),
  status: "pending" | "assigned" | "en-route" | "rescued" | "shelter-reached" | "closed",
  note: String,
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Socket.io Events Reference

### Emitted by Server

| Event | Data | Description |
|-------|------|-------------|
| `connected` | `{userId, message}` | Client successfully authenticated |
| `rescue-room-joined` | `{reportId, message}` | Client joined rescue tracking room |
| `rescue-update` | `{reportId, status, note, ...}` | Update for report creator |
| `rescue-status-update` | `{reportId, status, volunteerId, ...}` | Update for all tracking this rescue |
| `volunteer-assigned` | `{reportId, volunteer, status}` | Volunteer assigned event |
| `animal-rescued` | `{reportId, animalType, message}` | Animal rescue milestone |
| `animal-shelter-reached` | `{reportId, animalType, message}` | Shelter reached milestone |

### Sent by Client

| Event | Data | Description |
|-------|------|-------------|
| `join-user-room` | `userId` | Join user-specific room |
| `join-rescue-room` | `reportId` | Join rescue tracking room |

---

## Authorization & Security

### User Rooms
```javascript
// Only user with this ID receives updates
socket.join(`user:${userId}`);
io.to(`user:${userId}`).emit("rescue-update", data);
```

### Rescue Rooms
```javascript
// Anyone tracking this rescue gets updates
socket.join(`rescue:${reportId}`);
io.to(`rescue:${reportId}`).emit("rescue-status-update", data);
```

### API Authorization
```
PUT /api/reports/{reportId}/rescue-status
Authorization: Bearer {token}
```
Only the assigned volunteer or admin can update status.

---

## Performance Considerations

### Scaling Socket.io
For production with multiple servers, use **Redis adapter**:

```bash
npm install socket.io-redis
```

```javascript
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Memory Management
- Socket connections auto-clean on disconnect
- User rooms cleaned when no sockets remain
- Database indexes on `report` and `createdAt` for faster queries

---

## Debugging

### Check Active Connections
```bash
curl http://localhost:2002/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-06-15T10:30:00Z",
  "activeConnections": 5
}
```

### Monitor Socket Events
Enable debug logging:
```bash
DEBUG=socket.io npm run dev
```

### Test Client Output
```
[CONNECTED] Socket ID: abc123xyz
[AUTH] Successfully connected to real-time updates
[ROOM JOINED] Joined rescue tracking room
[STATUS UPDATE] {
  "status": "en-route",
  "note": "Volunteer reached location",
  ...
}
```

---

## Next Steps (Phase 2)

After this real-time system works, we'll add:

1. **Geospatial Search**
   - MongoDB 2dsphere indexes
   - Find reports within X miles
   - "Reports near me" feature

2. **AI Integration**
   - Animal type prediction from images
   - Smart matching of volunteers to animals

3. **Analytics**
   - Rescue completion rates
   - Average rescue time
   - Volunteer performance metrics

---

## Troubleshooting

### Client not receiving updates
- Check browser console for connection errors
- Verify server is running: `curl http://localhost:2002`
- Check auth token is valid
- Verify reportId and userId match actual data

### "Not authorized to update this rescue"
- Only assigned volunteer can update status
- Admin can update any rescue
- Check user token and permissions

### Connection drops frequently
- May be firewall blocking WebSocket
- Check browser CORS settings
- Try polling transport: `transports: ["websocket", "polling"]`

---

**Ready for Phase 2: Geospatial Search!** 🚀
