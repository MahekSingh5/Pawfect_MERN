# Pawfect Backend API Documentation

## Base URL
```
http://localhost:2002/api
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. User Endpoints

### Register User
- **POST** `/users/register`
- **Auth**: No
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "User registered successfully"
  }
  ```

### Login User
- **POST** `/users/login`
- **Auth**: No
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token"
  }
  ```

### Get User Profile
- **GET** `/users/profile`
- **Auth**: Required
- **Response**: Current user object

### Update User Profile
- **PUT** `/users/profile`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
  ```

### Change Password
- **PUT** `/users/change-password`
- **Auth**: Required
- **Body**:
  ```json
  {
    "currentPassword": "Password123",
    "newPassword": "NewPassword456"
  }
  ```

### Delete Account
- **DELETE** `/users/delete-account`
- **Auth**: Required
- **Body**:
  ```json
  {
    "password": "Password123"
  }
  ```

---

## 2. Report Endpoints

### Create Report
- **POST** `/reports`
- **Auth**: Required
- **Body** (multipart/form-data):
  ```
  animalType: "Dog"
  location: "Downtown Park"
  description: "Golden retriever, injured leg"
  contactNumber: "1234567890"
  image: <file>
  ```
- **Response**: Created report object

### Get Reports
- **GET** `/reports`
- **Auth**: Not required
- **Query Parameters**:
  - `status`: "pending", "in-progress", "rescued"
  - `animalType`: Animal type string
  - `location`: Location string (case-insensitive)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
  ```json
  {
    "totalReports": 50,
    "currentPage": 1,
    "totalPages": 5,
    "reports": [...]
  }
  ```

### Get Report by ID
- **GET** `/reports/:id`
- **Auth**: Not required

### Update Report
- **PUT** `/reports/:id`
- **Auth**: Required (owner or admin)
- **Body**:
  ```json
  {
    "animalType": "Cat",
    "location": "New Location",
    "description": "Updated description",
    "contactNumber": "9876543210",
    "status": "in-progress"
  }
  ```

### Delete Report
- **DELETE** `/reports/:id`
- **Auth**: Required (owner or admin)

### Update Report Status
- **PUT** `/reports/:id/status`
- **Auth**: Required (volunteer or admin)
- **Body**:
  ```json
  {
    "status": "rescued"
  }
  ```

### Assign Volunteer to Report
- **PUT** `/reports/assign-volunteer`
- **Auth**: Required (admin only)
- **Body**:
  ```json
  {
    "reportId": "report_id",
    "volunteerId": "volunteer_id"
  }
  ```

---

## 3. Volunteer Endpoints

### Apply as Volunteer
- **POST** `/volunteer/apply`
- **Auth**: Required
- **Body**:
  ```json
  {
    "phone": "1234567890",
    "city": "New York",
    "availability": "full-time",
    "preferredAnimals": ["Dog", "Cat"],
    "experience": "2 years of animal care"
  }
  ```

### Get My Volunteer Profile
- **GET** `/volunteer/me`
- **Auth**: Required

### Get All Volunteer Profiles
- **GET** `/volunteer/all`
- **Auth**: Required (admin only)

### Approve Volunteer
- **PUT** `/volunteer/approve/:id`
- **Auth**: Required (admin only)

### Reject Volunteer
- **PUT** `/volunteer/reject/:id`
- **Auth**: Required (admin only)

### De-approve Volunteer
- **PUT** `/volunteer/de-approve/:id`
- **Auth**: Required (admin only)

### Update Volunteer Profile
- **PUT** `/volunteer/update/:id`
- **Auth**: Required (volunteer owner or admin)
- **Body**:
  ```json
  {
    "phone": "9876543210",
    "city": "Boston",
    "availability": "part-time",
    "preferredAnimals": ["Dog"],
    "experience": "5 years experience"
  }
  ```

---

## 4. Adoption Endpoints

### Create Adoption Request
- **POST** `/adoptions`
- **Auth**: Required
- **Body**:
  ```json
  {
    "reportId": "report_id",
    "message": "I have a fenced yard and experience with dogs",
    "contactNumber": "1234567890"
  }
  ```

### Get My Adoption Requests
- **GET** `/adoptions/my`
- **Auth**: Required

### Get All Adoption Requests
- **GET** `/adoptions/all`
- **Auth**: Required (admin only)

### Update Adoption Status
- **PUT** `/adoptions/:id/status`
- **Auth**: Required (admin only)
- **Body**:
  ```json
  {
    "status": "approved",
    "reason": "Verified home and experience"
  }
  ```

---

## 5. Feedback Endpoints

### Create Feedback
- **POST** `/feedback`
- **Auth**: Required
- **Body**:
  ```json
  {
    "volunteerId": "volunteer_id",
    "reportId": "report_id",
    "rating": 5,
    "comment": "Excellent work!",
    "type": "volunteer"
  }
  ```

### Get My Feedback
- **GET** `/feedback/my`
- **Auth**: Required

### Get Volunteer Feedback
- **GET** `/feedback/volunteer/:volunteerId`
- **Auth**: Not required
- **Response**:
  ```json
  {
    "averageRating": 4.5,
    "feedbackCount": 10,
    "feedback": [...]
  }
  ```

### Get Report Feedback
- **GET** `/feedback/report/:reportId`
- **Auth**: Not required

### Get Search History
- **GET** `/feedback/search-history`
- **Auth**: Required

---

## 6. Dashboard Endpoints

### Get Dashboard Stats
- **GET** `/dashboard/stats`
- **Auth**: Required (admin only)
- **Response**:
  ```json
  {
    "stats": {
      "reports": {
        "total": 100,
        "pending": 20,
        "inProgress": 30,
        "rescued": 50,
        "completionRate": "50.00%"
      },
      "volunteers": {
        "total": 25,
        "approved": 20,
        "pending": 5
      },
      "adoptions": {
        "total": 50,
        "pending": 10,
        "approved": 35,
        "rejected": 5
      },
      "feedback": {
        "total": 100,
        "averageRating": "4.5"
      },
      "users": {
        "total": 500
      }
    }
  }
  ```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, token failed"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access only"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details"
}
```

---

## Validation Rules

### Email
- Must be valid email format (user@domain.com)

### Phone
- 10-15 characters
- Can include +, -, spaces, and digits

### Password
- Minimum 6 characters
- Must contain at least one letter and one number

### Animal Type
- Examples: "Dog", "Cat", "Bird", etc.

### Availability (Volunteer)
- "full-time"
- "part-time"
- "weekends"
- "on-call"

### Feedback Rating
- Between 1 and 5

---

## Environment Variables

Create a `.env` file with:
```
MONGO_URI=mongodb://localhost:27017/pawfect
JWT_SECRET=your_jwt_secret_key
PORT=2002

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@pawfect.com

# Cloudinary
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
```

---

## Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

---

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

---

## API Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Server Error

---

## Rate Limiting

Currently not implemented. Consider adding rate-limit middleware for production.

---

## CORS Configuration

CORS is enabled for all origins. Update `server.js` for production:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL
}));
```

---

## Version
API v1.0.0
