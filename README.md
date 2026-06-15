# Pawfect Backend

A comprehensive Node.js/Express backend for an animal shelter and adoption platform, featuring user management, report tracking, volunteer coordination, and adoption processing.

## 🎯 Features

- **User Management**: Registration, authentication, profile updates, password management
- **Report System**: Create animal rescue reports with image uploads to Cloudinary
- **Volunteer Management**: Volunteer applications, approvals, and profile management
- **Adoption System**: Adoption requests with approval/rejection workflow
- **Email Notifications**: Send emails on adoption status updates
- **Feedback & Ratings**: User feedback system with ratings
- **Search History**: Track user search patterns
- **Dashboard**: Admin statistics and analytics
- **Input Validation**: Comprehensive validation middleware
- **Role-Based Access Control**: User and admin roles

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd pawfect-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your values
```

### Environment Variables

```env
# Database
MONGO_URI=mongodb://localhost:27017/pawfect

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=2002

# Cloudinary (for image uploads)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Email Service (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@pawfect.com
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

Server will be available at `http://localhost:2002`

## 📁 Project Structure

```
pawfect-backend/
├── config/              # Configuration files
│   └── cloudinary.js   # Cloudinary setup
├── controllers/         # Business logic
│   ├── userController.js
│   ├── reportController.js
│   ├── volunteerController.js
│   ├── adoptionController.js
│   ├── feedbackController.js
│   └── dashboardController.js
├── middleware/         # Express middleware
│   ├── authMiddleware.js
│   ├── uploadMiddleware.js
│   ├── validationMiddleware.js
│   └── searchHistoryMiddleware.js
├── models/            # MongoDB schemas
│   ├── User.js
│   ├── Report.js
│   ├── VolunteerProfile.js
│   ├── AdoptionRequest.js
│   ├── Feedback.js
│   └── SearchHistory.js
├── routes/           # API routes
│   ├── userRoutes.js
│   ├── reportRoutes.js
│   ├── volunteerRoutes.js
│   ├── adoptionRoutes.js
│   ├── feedbackRoutes.js
│   └── dashboardRoutes.js
├── services/        # Business services
│   └── emailService.js
├── tests/          # Unit tests
│   ├── userController.test.js
│   ├── reportController.test.js
│   ├── volunteerController.test.js
│   └── adoptionController.test.js
├── server.js       # Main server file
├── package.json
└── API_DOCUMENTATION.md
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. 

### Getting a Token

1. Register or login to get a token
2. Include token in Authorization header:
   ```
   Authorization: Bearer <token>
   ```

### Token Expiry

- Tokens expire after 7 days
- Create a new token by logging in again

## 📚 API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint documentation.

### Main Routes

- **Users**: `/api/users` - Registration, login, profile management
- **Reports**: `/api/reports` - Animal rescue reports
- **Volunteers**: `/api/volunteer` - Volunteer management
- **Adoptions**: `/api/adoptions` - Adoption requests
- **Feedback**: `/api/feedback` - Ratings and reviews
- **Dashboard**: `/api/dashboard` - Admin statistics

## ✅ Validation

The API includes comprehensive input validation:

- **Email**: Valid email format
- **Phone**: 10-15 characters with +, -, spaces
- **Password**: Min 6 chars, at least 1 letter + 1 number
- **Availability**: full-time, part-time, weekends, on-call
- **Rating**: 1-5 scale
- **Status**: Predefined enum values

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test userController.test.js
```

## 📧 Email Notifications

Email notifications are sent when:
- Adoption request is approved
- Adoption request is rejected
- Volunteer is approved

Configure SMTP settings in `.env` to enable email functionality.

## 🔒 Security Features

- JWT authentication
- Password hashing with bcryptjs
- Role-based access control (user/admin)
- Input sanitization (XSS prevention)
- Email validation
- Phone validation
- Password strength validation

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## 📊 Database Models

### User
```
- name (String)
- email (String, unique)
- password (String, hashed)
- role (String: "user" or "admin")
- timestamps
```

### Report
```
- animalType (String)
- location (String)
- description (String)
- contactNumber (String)
- image (String - URL)
- reportedBy (ObjectId - User)
- assignedVolunteer (ObjectId - VolunteerProfile)
- status (String: "pending", "in-progress", "rescued")
- timestamps
```

### VolunteerProfile
```
- user (ObjectId - User)
- phone (String)
- city (String)
- availability (String)
- preferredAnimals (Array)
- experience (String)
- isApproved (Boolean)
- timestamps
```

### AdoptionRequest
```
- user (ObjectId - User)
- report (ObjectId - Report)
- message (String)
- contactNumber (String)
- status (String: "pending", "approved", "rejected")
- timestamps
```

### Feedback
```
- user (ObjectId - User)
- volunteer (ObjectId - VolunteerProfile)
- report (ObjectId - Report)
- rating (Number: 1-5)
- comment (String)
- type (String: "volunteer", "adoption", "rescue")
- timestamps
```

### SearchHistory
```
- user (ObjectId - User)
- query (String)
- filters (Object)
- resultsCount (Number)
- timestamps
```

## 🛠️ Development

### Adding a New Feature

1. Create model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Create tests in `tests/`
5. Add endpoint to `API_DOCUMENTATION.md`

### Git Workflow

```bash
git checkout -b feature/feature-name
git commit -am "Add feature"
git push origin feature/feature-name
```

## 📝 Environment Setup

### Local Development

```bash
# Install MongoDB locally or use MongoDB Atlas
# Update MONGO_URI in .env

# Get Cloudinary credentials from cloudinary.com
# Update CLOUD_* variables in .env

# For email (optional):
# Enable 2-Factor Authentication on Gmail
# Generate App Password
# Update EMAIL_* variables in .env
```

## 🐛 Debugging

Enable verbose logging:
```javascript
// In .env
DEBUG=pawfect:*
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **multer**: File uploads
- **cloudinary**: Image storage
- **nodemailer**: Email sending
- **dotenv**: Environment variables
- **cors**: Cross-origin requests

## 🧪 Dev Dependencies

- **nodemon**: Auto-reload on changes
- **jest**: Testing framework
- **supertest**: HTTP assertions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
1. Check API_DOCUMENTATION.md
2. Review error messages
3. Check console logs
4. Open an issue on GitHub

## 🚀 Deployment

### Heroku

```bash
git push heroku main
heroku logs --tail
```

### AWS/DigitalOcean

1. Set environment variables
2. Install dependencies
3. Run `npm start`
4. Configure MongoDB connection
5. Set up domain/SSL

## 📈 Performance Considerations

- Pagination on reports endpoint (max 100 per page)
- Indexing on frequently queried fields
- Email notifications sent asynchronously
- Consider adding Redis for caching

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Payment integration for donations
- [ ] Multi-language support
- [ ] Mobile app API versioning
- [ ] Advanced analytics
- [ ] File compression for images
- [ ] Rate limiting middleware
- [ ] Request logging with Winston

---

**Last Updated**: June 2024
**Version**: 1.0.0
