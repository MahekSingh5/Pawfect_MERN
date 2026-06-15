# Postman Collection for Socket.io Testing

This collection can be imported into Postman to test the real-time rescue tracking API.

## Import Instructions

1. Open Postman
2. Click "Import"
3. Upload this file or paste the JSON
4. Collection appears in your workspace

## Testing Workflow

### Step 1: Register/Login User
```
POST /api/users/register
```
Save the token and userId.

### Step 2: Create Report
```
POST /api/reports
```
Get the reportId.

### Step 3: Apply as Volunteer
```
POST /api/volunteer/apply
```

### Step 4: Approve Volunteer (Admin)
```
PUT /api/volunteer/approve/{volunteerId}
```

### Step 5: Assign Volunteer to Report (Admin)
```
PUT /api/reports/assign-volunteer
Body:
{
  "reportId": "...",
  "volunteerId": "..."
}
```

### Step 6: Run Socket Test Client
```bash
node socket-test-client.js
```

### Step 7: Update Rescue Status
```
PUT /api/reports/{reportId}/rescue-status
```
Watch the test client display real-time updates!

### Step 8: Get Rescue Timeline
```
GET /api/reports/{reportId}/timeline
```
See audit trail of all status changes.

---

## Environment Variables for Postman

Set these in Postman's environment:

```
{{base_url}} = http://localhost:2002/api
{{token}} = (from login)
{{admin_token}} = (admin login token)
{{report_id}} = (from create report)
{{volunteer_id}} = (from apply volunteer)
{{user_id}} = (from login)
```

---

## Real-Time Testing

1. **Terminal 1**: Start server
   ```bash
   npm run dev
   ```

2. **Terminal 2**: Run test client
   ```bash
   node socket-test-client.js
   ```

3. **Terminal 3**: Use Postman to send API requests

4. Watch Terminal 2 display real-time events!
