# OTT Platform Backend API

A complete, production-ready backend API for an OTT Video Streaming Platform built using the MERN stack (Node.js, Express, MongoDB, and Mongoose).

## Tech Stack
- **Server Framework**: Node.js & Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security**: Helmet, CORS, Express Rate Limiter, bcryptjs
- **Authentication**: JWT Access & Refresh Tokens, Cookie Parser
- **File Uploads**: Multer & Cloudinary (with fallback to local storage)
- **Payment Gateway**: Razorpay (with automatic subscription updates & mock environment support)
- **Emailer**: Nodemailer
- **Validation**: Express Validator
- **Logging**: Winston Logging Utility

---

## Folder Structure
```
backend/
├── src/
│   ├── config/          # Configurations
│   ├── controllers/     # Route controllers for business operations
│   ├── middleware/      # Auth, role check, uploads, error handling, rate limiting
│   ├── models/          # 21 Mongoose models
│   ├── routes/          # Express route structures
│   ├── services/        # Service layer (mail, razorpay, analytics)
│   ├── validators/      # Payload validators
│   ├── utils/           # Database seeding, logger, responses, jwt signing
│   ├── uploads/         # Local file storage folder
│   ├── docs/            # Swagger spec files
│   ├── app.js           # Express App registrations
│   └── server.js        # Server execution script
```

---

## 21 MongoDB Models Included
1. **User**: Client information & subscription references.
2. **Admin**: Platform roles (Super Admin, Admin, Content Manager, Finance Manager, Support Manager).
3. **Movie**: Video URLs, classifications, and rating/views statistics.
4. **Series**: TV Show details.
5. **Episode**: Season & episode reference indexes.
6. **Category**: Groupings (Movies, Series, Kids).
7. **Genre**: Action, Comedy, Sci-Fi, Thriller, etc.
8. **Language**: Media speech languages.
9. **Subscription**: Active plan links and validity checks.
10. **SubscriptionPlan**: Tier specifications (Premium, Standard, Basic).
11. **Payment**: Razorpay transaction logs.
12. **Coupon**: Code discounts (flat / percentage).
13. **Review**: Text reviews of movies & series.
14. **Rating**: Star ratings (1-5 scale).
15. **WatchHistory**: User watch history timeline logs.
16. **ContinueWatching**: Playback progress points for resuming.
17. **Wishlist**: Saved media list.
18. **Notification**: User notifications.
19. **Banner**: Carousels on homepage.
20. **Analytics**: Aggregates for administrative dashboards.
21. **AuditLog**: Admin modification logs.

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v16+)
- **MongoDB** (running locally on port `27017` or Atlas URI)

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ott_platform
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
...
```

### 4. Seed the Database
Populate administrative accounts, plans, movies, and episodes automatically:
```bash
npm run seed
```
**Default Admin Credentials created by seed:**
- **Super Admin**: `superadmin@ott.com` / `adminpassword123`
- **Content Manager**: `content@ott.com` / `adminpassword123`
- **Finance Manager**: `finance@ott.com` / `adminpassword123`
- **Support Manager**: `support@ott.com` / `adminpassword123`
- **Standard User**: `john@example.com` / `userpassword123`

### 5. Run Server
Start the development server with Hot Reload:
```bash
npm run dev
```

---

## API Documentation & Testing

### 1. Interactive Swagger UI
Once the server is running, navigate to:
[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### 2. Postman Collection
Import `postman_collection.json` located in the root of the project to test all endpoints.

---

## Key Features & Highlights

### ⚡ Development Mock Fallback Modes
- **Razorpay**: If Razorpay API keys are omitted or set to placeholder/default strings in `.env`, the Payment Service switches to **Mock mode**. It will successfully create order structures, process mock verify payloads (`razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature` non-empty strings), record the payment, and activate user subscriptions immediately.
- **Nodemailer**: If SMTP settings are default, system emails (e.g. forgot password resets) are printed to the Winston logs console.
- **Multer / Cloudinary**: Files are uploaded to local storage path `backend/src/uploads/` if Cloudinary credentials are missing.
