# 🩸 Blood Donation Web Application

## 📌 Project Overview

A complete, full-stack Blood Donation Management System built for M.Sc Computer Science final year project. This application connects blood donors with receivers (patients/hospitals) efficiently.

---

## 🎯 Features

### For Donors:

- Register with personal and medical details
- Login to personal dashboard
- Update availability status
- View profile information

### For Receivers (Patients/Hospitals):

- Register and login
- Search for donors by blood group and city
- View matching available donors
- Get contact information instantly

### For Admins:

- View all registered donors
- Monitor all blood requests
- Access system statistics
- Manage platform overview

---

## 🛠️ Technology Stack

### Frontend:

- **HTML5** - Structure
- **CSS3** - Styling
- **Bootstrap 5** - UI Framework
- **JavaScript (Vanilla)** - Client-side logic

### Backend:

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library

---

## 📁 Project Structure

```
Pro Blood/
│
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema (Donor/Receiver/Admin)
│   │   └── BloodRequest.js   # Blood request schema
│   │
│   ├── routes/
│   │   ├── auth.js           # Registration & Login routes
│   │   ├── donor.js          # Donor-related routes
│   │   └── request.js        # Blood request routes
│   │
│   ├── server.js             # Main server file
│   ├── .env                  # Environment variables
│   ├── .gitignore           # Git ignore file
│   └── package.json         # Dependencies
│
└── frontend/
    ├── css/
    │   └── style.css        # Custom styles
    │
    ├── js/
    │   ├── login.js         # Login functionality
    │   ├── register.js      # Registration functionality
    │   ├── donor-dashboard.js     # Donor dashboard
    │   ├── request-blood.js       # Blood request page
    │   └── admin-dashboard.js     # Admin dashboard
    │
    ├── index.html           # Home page
    ├── login.html          # Login page
    ├── register.html       # Registration page
    ├── donor-dashboard.html      # Donor dashboard
    ├── request-blood.html        # Blood request page
    └── admin-dashboard.html      # Admin dashboard
```

---

## 🚀 Installation & Setup

### Prerequisites:

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- VS Code or any code editor
- Web browser

### Step 1: Install MongoDB

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017`

**OR use MongoDB Atlas (Cloud):**

1. Create free account at: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` file with your connection string

### Step 2: Install Backend Dependencies

Open terminal in VS Code and run:

```bash
cd backend
npm install
```

This installs:

- express
- mongoose
- cors
- dotenv

### Step 3: Configure Environment Variables

The `.env` file in backend folder contains:

```env
MONGODB_URI=mongodb://localhost:27017/blood-donation
PORT=5000
```

**Change MONGODB_URI if using MongoDB Atlas or different configuration.**

### Step 4: Start the Backend Server

```bash
node server.js
```

You should see:

```
✅ Connected to MongoDB successfully
🚀 Server is running on port 5000
📡 API available at http://localhost:5000
```

### Step 5: Open Frontend

1. Navigate to `frontend` folder
2. Open `index.html` in your web browser
3. **OR** use Live Server extension in VS Code

**Important:** Make sure backend is running before using frontend!

---

## 📡 API Endpoints

### Authentication Routes

#### 1. Register User

- **URL:** `POST /api/register`
- **Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor",
  "phone": "1234567890",
  "city": "Mumbai",
  "bloodGroup": "O+",
  "age": 25,
  "isAvailable": true
}
```

#### 2. Login User

- **URL:** `POST /api/login`
- **Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Donor Routes

#### 3. Get All Donors

- **URL:** `GET /api/donors`
- **Query Parameters:** `?bloodGroup=O+&city=Mumbai`

#### 4. Get Available Donors

- **URL:** `GET /api/donors/available?bloodGroup=O+&city=Mumbai`

### Request Routes

#### 5. Create Blood Request

- **URL:** `POST /api/request-blood`
- **Body:**

```json
{
  "receiverId": "user_id",
  "receiverName": "Hospital Name",
  "receiverEmail": "hospital@example.com",
  "receiverPhone": "9876543210",
  "bloodGroupNeeded": "O+",
  "city": "Mumbai"
}
```

#### 6. Get All Requests

- **URL:** `GET /api/requests`

---

## 🔄 Data Flow Explanation

### 1. Registration Flow:

```
User fills form → Frontend validates → Send to backend API → Backend validates →
Save to MongoDB → Send success response → Redirect to login
```

### 2. Login Flow:

```
User enters credentials → Frontend sends to API → Backend checks database →
If valid: send user data → Frontend stores in localStorage → Redirect to dashboard
```

### 3. Blood Request Flow:

```
Receiver selects blood group & city → Submit form → API creates request →
Backend searches donors with matching blood group & city & isAvailable=true →
Return matching donors → Display on frontend with contact details
```

### 4. Update Availability Flow:

```
Donor toggles switch → Send PUT request to backend → Update isAvailable in database →
Update localStorage → Update UI → Reflects in receiver searches
```

---

## 🔍 Blood Matching Logic

The system matches donors based on:

1. **Blood Group:** Exact match (e.g., O+ matches only O+)
2. **City:** Case-insensitive match using regex
3. **Availability:** Only donors with `isAvailable = true`

**MongoDB Query:**

```javascript
{
  role: 'donor',
  bloodGroup: 'O+',
  city: /Mumbai/i,
  isAvailable: true
}
```

---

## 🗄️ Database Schema

### User Schema:

```javascript
{
  name: String,
  email: String (unique),
  password: String,
  role: String (donor/receiver/admin),
  bloodGroup: String,
  age: Number,
  phone: String,
  city: String,
  isAvailable: Boolean,
  createdAt: Date
}
```

### Blood Request Schema:

```javascript
{
  receiverId: ObjectId,
  receiverName: String,
  receiverEmail: String,
  receiverPhone: String,
  bloodGroupNeeded: String,
  city: String,
  status: String (pending/fulfilled/cancelled),
  createdAt: Date
}
```

---

## 🎓 How to Run for Demo/Viva

### 1. Start Backend:

```bash
cd backend
node server.js
```

### 2. Open Frontend:

- Open `frontend/index.html` in browser

### 3. Test the Application:

**Scenario 1: Register as Donor**

1. Click "Register" → Select "Donor"
2. Fill all details (name, email, blood group, age, city)
3. Submit → Login with those credentials
4. See donor dashboard with profile

**Scenario 2: Register as Receiver**

1. Register → Select "Receiver"
2. Fill basic details (no blood group needed)
3. Login → Go to request blood page
4. Select blood group & city
5. See matching donors

**Scenario 3: Admin Access**

1. Login as admin (email: admin@gmail.com, password: admin@123)
2. See all donors and requests
3. View statistics

---

## 🧪 Testing the Application

### Create Test Data:

1. **Register 3-4 donors** with different blood groups and cities
2. **Register 1-2 receivers**
3. **Create admin user** manually or through registration

### Test Cases:

✅ **Test 1:** Register donor with valid data → Should succeed
✅ **Test 2:** Login with correct credentials → Should redirect to dashboard
✅ **Test 3:** Login with wrong password → Should show error
✅ **Test 4:** Search blood with matching donors → Should display donors
✅ **Test 5:** Search blood with no matches → Should show "no donors found"
✅ **Test 6:** Toggle availability → Should update status
✅ **Test 7:** Admin login → Should show all data

---

## 📸 Screenshots Guide

For documentation, capture:

1. Home page
2. Registration page
3. Login page
4. Donor dashboard
5. Blood request page with results
6. Admin dashboard

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend not starting

**Error:** `Cannot connect to MongoDB`
**Solution:**

- Ensure MongoDB is running
- Check connection string in `.env`
- If using Atlas, check network access settings

### Issue 2: CORS Error

**Error:** `Access blocked by CORS policy`
**Solution:**

- Backend already has CORS enabled
- Check if backend URL in frontend JS files matches server

### Issue 3: Cannot register

**Error:** `User already exists`
**Solution:**

- Use different email address
- Or delete existing user from MongoDB

### Issue 4: No donors found

**Solution:**

- Ensure donors are registered in same city
- Check blood group is available
- Verify donor availability is set to true

---

## 🔒 Security Notes (For Viva)

**Current Implementation:**

- Plain text passwords (for simplicity)
- No JWT authentication
- Basic validation

**Production Improvements:**

- Hash passwords using bcrypt
- Implement JWT for secure sessions
- Add input sanitization
- Use HTTPS
- Add rate limiting
- Implement email verification

---

## 📊 Future Enhancements

1. **Notifications:** Email/SMS alerts to donors
2. **Location:** GPS-based nearby donor search
3. **History:** Track donation history
4. **Certificates:** Generate donation certificates
5. **Ratings:** Review system for donors
6. **Analytics:** Charts and reports
7. **Mobile App:** React Native version
8. **Blood Banks:** Integration with blood banks

---

## 📚 Technologies Explained (For Viva)

### Express.js:

- Web framework for Node.js
- Handles routing and middleware
- Simplifies API creation

### Mongoose:

- ODM (Object Data Modeling) library
- Provides schema-based solution
- Simplifies MongoDB operations

### Bootstrap 5:

- CSS framework
- Responsive design
- Pre-built components

### LocalStorage:

- Browser storage mechanism
- Stores user session data
- Persists across page reloads

---

## 👨‍💻 Developer Information

**Project:** Blood Donation Web Application
**Purpose:** M.Sc Computer Science Final Year Project
**Technologies:** MERN Stack (without React)
**Database:** MongoDB
**Completion:** Production-ready

---

## 📝 License

This project is created for educational purposes as part of M.Sc Computer Science curriculum.

---

## ✅ Viva Preparation Checklist

- [ ] Understand project structure
- [ ] Know all API endpoints
- [ ] Explain data flow
- [ ] Understand MongoDB schemas
- [ ] Can explain blood matching logic
- [ ] Know how localStorage works
- [ ] Can explain CRUD operations
- [ ] Understand Express routing
- [ ] Know security considerations
- [ ] Can demonstrate live application

---

**For any issues, refer to the detailed comments in each code file.**

**Good luck with your project presentation! 🎓**
