# Phase 2: Geospatial Search Implementation

## Overview

Pawfect Backend now supports **MongoDB geospatial queries** for:
- Finding rescue reports near a location
- Finding approved volunteers near a location
- Finding shelters near a rescue location
- Auto-suggesting volunteers when a report is created
- Real-time volunteer location tracking

---

## Database Schema Updates

### 1. Report Model

**New Fields:**
```javascript
address: String              // Human-readable address
location: {                  // GeoJSON Point
  type: "Point",
  coordinates: [longitude, latitude]  // IMPORTANT: [lng, lat] NOT [lat, lng]
}
```

**Index:**
```javascript
reportSchema.index({ location: "2dsphere" });
```

### 2. VolunteerProfile Model

**New Fields:**
```javascript
currentLocation: {           // GeoJSON Point for volunteer position
  type: "Point",
  coordinates: [Number]
}
```

**Index:**
```javascript
volunteerProfileSchema.index({ currentLocation: "2dsphere" });
```

### 3. Shelter Model (NEW)

```javascript
{
  name: String,
  address: String,
  phone: String (required),
  email: String,
  location: {               // GeoJSON Point
    type: "Point",
    coordinates: [longitude, latitude]
  },
  capacity: Number,         // Max animals
  currentAnimals: Number,   // Animals currently housed
  availableSpace: Number,   // capacity - currentAnimals
  specializations: String[] // Dogs, Cats, Birds, etc.
  website: String,
  operatingHours: String,
  description: String,
  timestamps
}
```

---

## API Endpoints

### Reports - Geospatial

#### 1. Create Report with Auto-Suggested Volunteers
```http
POST /api/reports
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "animalType": "Dog",
  "address": "Sector 34, Chandigarh",
  "latitude": 30.7333,
  "longitude": 76.7794,
  "description": "Lost puppy, brown color",
  "contactNumber": "9876543210",
  "image": (file)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report created successfully",
  "report": {
    "_id": "...",
    "animalType": "Dog",
    "address": "Sector 34, Chandigarh",
    "location": {
      "type": "Point",
      "coordinates": [76.7794, 30.7333]
    },
    "status": "pending",
    "reportedBy": { "name": "John", "email": "john@example.com" },
    "suggestedVolunteers": [
      {
        "volunteerId": "...",
        "name": "Rahul",
        "email": "rahul@example.com",
        "phone": "9876543210",
        "city": "Chandigarh",
        "availability": "full-time"
      },
      {
        "volunteerId": "...",
        "name": "Priya",
        "email": "priya@example.com",
        "phone": "9876543211",
        "city": "Chandigarh",
        "availability": "part-time"
      }
    ]
  }
}
```

#### 2. Find Nearby Reports
```http
GET /api/reports/nearby?lat=30.7333&lng=76.7794&maxDistance=5000
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude of search center |
| lng | number | Yes | Longitude of search center |
| maxDistance | number | No | Maximum distance in meters (default: 5000) |

**Response:**
```json
{
  "success": true,
  "count": 3,
  "searchCenter": {
    "type": "Point",
    "coordinates": [76.7794, 30.7333]
  },
  "maxDistanceMeters": 5000,
  "reports": [
    {
      "_id": "...",
      "animalType": "Dog",
      "address": "Sector 34",
      "location": { "type": "Point", "coordinates": [...] },
      "status": "pending",
      "reportedBy": { "name": "John" }
    }
  ]
}
```

#### 3. Get Nearby Shelters for a Report
```http
GET /api/reports/{reportId}/nearby-shelters?maxDistance=10000
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "reportLocation": {
    "type": "Point",
    "coordinates": [76.7794, 30.7333]
  },
  "maxDistanceMeters": 10000,
  "shelters": [
    {
      "_id": "...",
      "name": "Happy Tails Shelter",
      "address": "Street 5, Sector 22",
      "phone": "0172-1234567",
      "capacity": 50,
      "currentAnimals": 35,
      "availableSpace": 15,
      "location": { "type": "Point", "coordinates": [...] }
    }
  ]
}
```

---

### Volunteers - Geospatial

#### 1. Update Volunteer Location
```http
PUT /api/volunteer/update-location
Authorization: Bearer {token}
Content-Type: application/json

{
  "latitude": 30.7333,
  "longitude": 76.7794
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "volunteer": {
    "_id": "...",
    "name": "Rahul",
    "location": {
      "type": "Point",
      "coordinates": [76.7794, 30.7333]
    }
  }
}
```

#### 2. Find Nearest Approved Volunteers
```http
GET /api/volunteer/nearest?lat=30.7333&lng=76.7794&maxDistance=10000&limit=10
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude of search center |
| lng | number | Yes | Longitude of search center |
| maxDistance | number | No | Maximum distance in meters (default: 10000) |
| limit | number | No | Max results (default: 10) |

**Response:**
```json
{
  "success": true,
  "count": 5,
  "searchCenter": {
    "type": "Point",
    "coordinates": [76.7794, 30.7333]
  },
  "maxDistanceMeters": 10000,
  "volunteers": [
    {
      "volunteerId": "...",
      "userId": "...",
      "name": "Rahul",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "city": "Chandigarh",
      "availability": "full-time",
      "preferredAnimals": ["Dogs", "Cats"],
      "experience": "5 years experience",
      "location": {
        "type": "Point",
        "coordinates": [76.7794, 30.7333]
      }
    }
  ]
}
```

---

### Shelters - Endpoints

#### 1. Create Shelter (Admin)
```http
POST /api/shelters
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Happy Tails Shelter",
  "address": "Street 5, Sector 22, Chandigarh",
  "phone": "0172-1234567",
  "email": "info@happytails.org",
  "latitude": 30.7333,
  "longitude": 76.7794,
  "capacity": 50,
  "specializations": ["Dogs", "Cats"],
  "website": "https://happytails.org",
  "operatingHours": "9:00 AM - 6:00 PM",
  "description": "Rescue and rehabilitation center for stray animals"
}
```

#### 2. Get All Shelters
```http
GET /api/shelters
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "shelters": [...]
}
```

#### 3. Get Shelter by ID
```http
GET /api/shelters/{id}
```

#### 4. Find Nearby Shelters
```http
GET /api/shelters/nearby?lat=30.7333&lng=76.7794&maxDistance=15000
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude of search center |
| lng | number | Yes | Longitude of search center |
| maxDistance | number | No | Maximum distance in meters (default: 15000) |

**Response:**
```json
{
  "success": true,
  "count": 2,
  "searchCenter": {
    "type": "Point",
    "coordinates": [76.7794, 30.7333]
  },
  "maxDistanceMeters": 15000,
  "shelters": [
    {
      "_id": "...",
      "name": "Happy Tails Shelter",
      "address": "Street 5, Sector 22",
      "phone": "0172-1234567",
      "location": { "type": "Point", "coordinates": [...] },
      "capacity": 50,
      "currentAnimals": 35,
      "availableSpace": 15,
      "specializations": ["Dogs", "Cats"],
      "distanceKm": "2.14"
    }
  ]
}
```

#### 5. Update Shelter (Admin)
```http
PUT /api/shelters/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "currentAnimals": 40,
  "availableSpace": 10,
  "phone": "0172-7654321"
}
```

#### 6. Delete Shelter (Admin)
```http
DELETE /api/shelters/{id}
Authorization: Bearer {admin_token}
```

---

## Key Concepts

### GeoJSON Format

MongoDB uses GeoJSON for geospatial data:

```javascript
// CORRECT: [longitude, latitude]
{
  type: "Point",
  coordinates: [76.7794, 30.7333]  // [lon, lat]
}

// WRONG: [latitude, longitude]
{
  type: "Point",
  coordinates: [30.7333, 76.7794]  // This is backwards!
}
```

**Why [longitude, latitude]?** International standard (RFC 7946)

### 2dsphere Index

The `2dsphere` index in MongoDB:
- Optimized for earth-based coordinates
- Supports large geographic areas
- Much faster than linear searches
- Automatically sorts by distance

```javascript
// Without index: Query all 100,000 documents, calculate distances
// With index: Use spatial tree, return nearby documents instantly
```

### Distance Calculations

MongoDB returns distance in **meters**:

```javascript
const maxDistance = 5000;  // 5000 meters = 5 km
```

Frontend can convert:
```javascript
const km = distanceMeters / 1000;
const miles = km * 0.621371;
```

### Auto-Suggested Volunteers

When a report is created, system:
1. Gets report location: `[76.7794, 30.7333]`
2. Searches for approved volunteers within 10 km
3. Returns top 5 closest volunteers sorted by distance
4. Frontend displays: "Suggested volunteers who can help"

---

## Usage Examples

### Example 1: Lost Dog Report → Auto-Suggest Volunteers

**Step 1: User creates report**
```bash
POST /api/reports
{
  "animalType": "Dog",
  "address": "Park Street, Sector 34",
  "latitude": 30.7333,
  "longitude": 76.7794,
  "description": "Lost puppy"
}
```

**Response includes:**
```json
"suggestedVolunteers": [
  { "name": "Rahul", "phone": "9876543210" },
  { "name": "Priya", "phone": "9876543211" }
]
```

**Step 2: Admin clicks "Suggest Volunteer"**
- Selects Rahul from suggestions
- API calls: `PUT /api/reports/assign-volunteer`
- Rahul gets notified in real-time (Socket.io)

---

### Example 2: Volunteer Tracking

**Step 1: Volunteer updates location while responding to call**
```bash
PUT /api/volunteer/update-location
{ "latitude": 30.7350, "longitude": 76.7810 }
```

**Step 2: Report creator sees real-time location**
- Socket.io emits: `rescue-status-update` with location
- Frontend shows marker moving on map

**Step 3: Find nearest shelter**
```bash
GET /api/reports/{reportId}/nearby-shelters?maxDistance=5000
```

Response: "Closest shelter is 1.2 km away"

---

### Example 3: Dashboard Analytics (Phase 3)

**Retrieve rescue hotspots:**
```javascript
// Aggregate reports by location clusters
db.reports.aggregate([
  {
    $group: {
      _id: {
        lat: { $trunc: "$location.coordinates[1]" },
        lng: { $trunc: "$location.coordinates[0]" }
      },
      count: { $sum: 1 }
    }
  }
])
```

Result:
```
Sector 34: 25 rescues
Sector 22: 18 rescues
Sector 17: 15 rescues
```

---

## Testing Endpoints

### Using cURL

```bash
# 1. Create report with auto-suggested volunteers
curl -X POST http://localhost:2002/api/reports \
  -H "Authorization: Bearer $TOKEN" \
  -F "animalType=Dog" \
  -F "address=Sector 34" \
  -F "latitude=30.7333" \
  -F "longitude=76.7794" \
  -F "description=Lost puppy" \
  -F "contactNumber=9876543210" \
  -F "image=@dog.jpg"

# 2. Find nearby reports
curl -X GET "http://localhost:2002/api/reports/nearby?lat=30.7333&lng=76.7794&maxDistance=5000"

# 3. Update volunteer location
curl -X PUT http://localhost:2002/api/volunteer/update-location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 30.7333, "longitude": 76.7794}'

# 4. Find nearest volunteers
curl -X GET "http://localhost:2002/api/volunteer/nearest?lat=30.7333&lng=76.7794&maxDistance=10000"

# 5. Create shelter
curl -X POST http://localhost:2002/api/shelters \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Happy Tails",
    "address": "Sector 22",
    "phone": "0172-1234567",
    "latitude": 30.7333,
    "longitude": 76.7794,
    "capacity": 50
  }'

# 6. Find nearby shelters
curl -X GET "http://localhost:2002/api/shelters/nearby?lat=30.7333&lng=76.7794&maxDistance=10000"
```

### Using Postman

Import the environment variables:
```
{{latitude}} = 30.7333
{{longitude}} = 76.7794
{{report_id}} = (from create report response)
{{shelter_id}} = (from create shelter response)
```

Then use pre-built requests:
- `Create Report with Auto-Suggest`
- `Find Nearby Reports`
- `Find Nearest Volunteers`
- `Create Shelter`
- `Find Nearby Shelters`

---

## Performance Optimization

### Index Statistics

```bash
# Check index usage
db.reports.getIndexes()
db.volunteersprofiles.getIndexes()
db.shelters.getIndexes()
```

Expected output:
```json
[
  { "key": { "_id": 1 } },           // Default
  { "key": { "location": "2dsphere" } }  // Geospatial index
]
```

### Query Optimization

**Without 2dsphere index:**
- 100,000 documents → Full collection scan
- Calculate distance for each → O(n) complexity
- Response time: 2-5 seconds ❌

**With 2dsphere index:**
- Use spatial tree → B-tree lookup
- Return only nearby documents
- Response time: 50-200 ms ✅

### Scaling Tips

1. **Partition by region** - Split large datasets by city/state
2. **Use Redis caching** - Cache popular searches
3. **Batch location updates** - Update volunteer locations every 30 seconds
4. **Archive old reports** - Move closed rescues to archive collection

---

## Security Considerations

### 1. Input Validation
```javascript
// ✅ SAFE
if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
  throw new Error("Invalid coordinates");

// ❌ UNSAFE
const report = await Report.find({
  location: { $near: userInput }  // Direct user input
});
```

### 2. Authorization
```javascript
// ✅ SAFE - Only show nearby reports to authenticated user
router.get("/nearby", 
  protect,  // JWT verification
  getNearbyReports
);

// ❌ UNSAFE - Public location data
router.get("/nearby", getNearbyReports);
```

### 3. Rate Limiting
```javascript
// Prevent location query abuse
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100  // 100 requests per 15 minutes
});

router.get("/nearby", limiter, getNearbyReports);
```

---

## Frontend Integration (Preparing for Phase 3)

### React Example
```jsx
import { useState, useEffect } from "react";

function ReportForm() {
  const [nearby, setNearby] = useState([]);

  const handleLocationChange = async (lat, lng) => {
    // Find nearby reports
    const res = await fetch(
      `http://localhost:2002/api/reports/nearby?lat=${lat}&lng=${lng}`
    );
    const data = await res.json();
    setNearby(data.reports);
  };

  return (
    <div>
      <input onChange={(e) => handleLocationChange(e.target.value)} />
      <div>
        {nearby.map(report => (
          <p key={report._id}>{report.address}</p>
        ))}
      </div>
    </div>
  );
}
```

### Vue Example
```vue
<template>
  <div>
    <input @change="handleLocationChange" placeholder="Enter location" />
    <div v-for="report in nearby" :key="report._id">
      {{ report.address }}
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const nearby = ref([]);

    const handleLocationChange = async (lat, lng) => {
      const res = await fetch(
        `http://localhost:2002/api/reports/nearby?lat=${lat}&lng=${lng}`
      );
      const data = await res.json();
      nearby.value = data.reports;
    };

    return { nearby, handleLocationChange };
  }
};
</script>
```

---

## Troubleshooting

### "Index not built" Error
```
MongoError: error TS7322 could not be indexed

Solution:
1. Drop old indexes: db.reports.dropIndex({ location: 1 })
2. Rebuild geospatial: db.reports.createIndex({ location: "2dsphere" })
```

### "Invalid coordinates" Error
```
Make sure coordinates are [longitude, latitude], not [latitude, longitude]

✅ Correct:   [76.7794, 30.7333]
❌ Wrong:     [30.7333, 76.7794]
```

### Empty Results
```
Check 1: Are there documents with location field?
db.reports.find({ location: { $exists: true } }).count()

Check 2: Is maxDistance in meters?
maxDistance=5000  // 5 km, not 5 meters

Check 3: Are coordinates valid?
db.reports.find({ "location.coordinates": { $exists: true } })
```

### Slow Queries
```
Check if index exists:
db.reports.getIndexes()

If missing, create:
db.reports.createIndex({ location: "2dsphere" })

Check query plan:
db.reports.find({
  location: { $near: { ... } }
}).explain("executionStats")
```

---

## Files Modified/Created

### New Files
- `models/Shelter.js` - Shelter model with geospatial support
- `controllers/shelterController.js` - Shelter CRUD operations
- `routes/shelterRoutes.js` - Shelter API routes

### Modified Files
- `models/Report.js` - Added geospatial location field and 2dsphere index
- `models/VolunteerProfile.js` - Added currentLocation with geospatial index
- `controllers/reportController.js` - Updated createReport with auto-suggestions, added getNearbyReports, getNearbyShelters
- `controllers/volunteerController.js` - Added getNearestVolunteers, updateVolunteerLocation
- `routes/reportRoutes.js` - Added geospatial endpoints
- `routes/volunteerRoutes.js` - Added geospatial endpoints
- `server.js` - Added shelter routes mounting

---

## Phase 2 Summary

✅ **Geospatial Search**: Find reports/volunteers/shelters nearby
✅ **Auto-Suggestions**: Volunteers auto-suggested when report created
✅ **Distance Sorting**: Results sorted by distance automatically
✅ **Audit Trail**: RescueUpdate tracks all location changes
✅ **Real-Time Updates**: Socket.io integration for location sharing
✅ **Production Ready**: 2dsphere indexes for performance

---

## Next Steps (Phase 3)

- 🗺️ Google Maps integration for frontend visualization
- 📊 Analytics dashboard showing rescue hotspots
- 🤖 AI integration for animal type detection
- 📱 Mobile app with push notifications
- 🚀 Volunteer performance metrics and leaderboard

---

**Status: Phase 2 Complete! Ready for production deployment.** 🎉
