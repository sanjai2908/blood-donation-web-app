# 📋 QUICK REFERENCE CARD

## Blood Donation Web Application - Cheat Sheet

---

## 🚀 QUICK START COMMANDS

### Start Backend:

```powershell
cd backend
node server.js
```

### Open Frontend:

```powershell
cd frontend
start index.html
```

---

## 🔐 TEST CREDENTIALS

### Donor:

```
Email: donor@test.com
Password: donor123
```

### Receiver:

```
Email: receiver@test.com
Password: receiver123
```

### Admin:

```
Email: admin@gmail.com
Password: admin@123
```

---

## 📡 API ENDPOINTS

| Method | Endpoint                    | Purpose              |
| ------ | --------------------------- | -------------------- |
| POST   | /api/register               | Register new user    |
| POST   | /api/login                  | Login user           |
| GET    | /api/donors                 | Get all donors       |
| GET    | /api/donors/available       | Get available donors |
| POST   | /api/request-blood          | Create blood request |
| GET    | /api/requests               | Get all requests     |
| PUT    | /api/donor/:id/availability | Update availability  |

---

## 🗄️ MONGODB COMMANDS

### Connect to MongoDB:

```bash
mongosh
```

### View Data:

```javascript
use blood-donation
db.users.find()
db.bloodrequests.find()
```

### Count Records:

```javascript
db.users.countDocuments();
```

### Delete All Data (Fresh Start):

```javascript
db.users.deleteMany({});
db.bloodrequests.deleteMany({});
```

---

## 🎯 PROJECT STRUCTURE SUMMARY

```
Pro Blood/
├── backend/                 # Server-side code
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── server.js           # Main server file
│   └── .env                # Configuration
└── frontend/               # Client-side code
    ├── css/                # Stylesheets
    ├── js/                 # JavaScript files
    └── *.html              # HTML pages
```

---

## 🔍 DEBUGGING CHECKLIST

### Backend not starting?

- [ ] MongoDB is running
- [ ] npm install completed
- [ ] .env file exists
- [ ] Port 5000 is free

### Frontend not working?

- [ ] Backend is running
- [ ] Check browser console (F12)
- [ ] Check API_URL in JS files
- [ ] CORS enabled in backend

### Login not working?

- [ ] User registered in database
- [ ] Correct email/password
- [ ] Check browser console
- [ ] Check localStorage

### No donors found?

- [ ] Donor registered in same city
- [ ] Blood group matches
- [ ] Donor availability is true
- [ ] Check spelling of city name

---

## 🧪 BLOOD GROUP COMPATIBILITY

### Universal Donor: O-

Can donate to: All blood groups

### Universal Receiver: AB+

Can receive from: All blood groups

### Compatibility Chart:

| Can Donate To → | O-  | O+  | B-  | B+  | A-  | A+  | AB- | AB+ |
| --------------- | --- | --- | --- | --- | --- | --- | --- | --- |
| **O-**          | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |
| **O+**          |     | ✓   |     | ✓   |     | ✓   |     | ✓   |
| **B-**          |     |     | ✓   | ✓   |     |     | ✓   | ✓   |
| **B+**          |     |     |     | ✓   |     |     |     | ✓   |
| **A-**          |     |     |     |     | ✓   | ✓   | ✓   | ✓   |
| **A+**          |     |     |     |     |     | ✓   |     | ✓   |
| **AB-**         |     |     |     |     |     |     | ✓   | ✓   |
| **AB+**         |     |     |     |     |     |     |     | ✓   |

---

## 💡 KEY CONCEPTS FOR VIVA

### 1. What is this project?

"A full-stack web application connecting blood donors with receivers using Node.js, Express, MongoDB, and vanilla JavaScript."

### 2. How does blood matching work?

"System matches based on exact blood group, city (case-insensitive), and donor availability status using MongoDB queries."

### 3. Main features?

"Donor registration, receiver search, admin monitoring, availability updates, and real-time donor matching."

### 4. Tech stack rationale?

"Node.js for JavaScript across stack, Express for REST API, MongoDB for flexible schema, Bootstrap for responsive UI."

### 5. Security measures?

"Email uniqueness, field validation, role-based access. Production would add: bcrypt passwords, JWT auth, input sanitization."

---

## 📊 SYSTEM WORKFLOW

```
Registration → Validation → Save to DB → Login →
Dashboard (role-based) → Actions (donate/request) →
Matching Algorithm → Display Results → Contact
```

---

## 🔐 USER ROLES & ACCESS

| Feature             | Donor | Receiver | Admin |
| ------------------- | ----- | -------- | ----- |
| Register            | ✓     | ✓        | ✓     |
| Login               | ✓     | ✓        | ✓     |
| View Profile        | ✓     | ✗        | ✗     |
| Update Availability | ✓     | ✗        | ✗     |
| Request Blood       | ✗     | ✓        | ✗     |
| View All Donors     | ✗     | ✗        | ✓     |
| View All Requests   | ✗     | ✗        | ✓     |
| View Statistics     | ✗     | ✗        | ✓     |

---

## 🛠️ TECHNOLOGY EXPLANATIONS

### Express.js

Web framework for Node.js. Handles routing, middleware, and HTTP requests/responses.

### Mongoose

ODM (Object Data Modeling) library. Provides schema-based solution for MongoDB data.

### CORS

Cross-Origin Resource Sharing. Allows frontend (different origin) to access backend API.

### LocalStorage

Browser storage API. Stores user session data that persists across page reloads.

### REST API

Architectural style using HTTP methods (GET, POST, PUT, DELETE) for CRUD operations.

### Bootstrap

CSS framework. Provides responsive grid system and pre-built UI components.

---

## 📝 COMMON VIVA QUESTIONS - QUICK ANSWERS

**Q: Why MongoDB over MySQL?**
A: Flexible schema, JSON format matches JavaScript, no complex joins needed, easier to scale.

**Q: How does authentication work?**
A: User submits credentials → Backend verifies → Returns user data → Frontend stores in localStorage → Role-based redirect.

**Q: What is middleware?**
A: Functions that execute during request-response cycle. Examples: JSON parser, CORS, logger.

**Q: How to improve security?**
A: Hash passwords (bcrypt), use JWT, sanitize inputs, HTTPS, rate limiting, email verification.

**Q: How does the matching algorithm work?**
A: MongoDB query filters by role='donor', exact blood group, city (regex), isAvailable=true.

**Q: What is the data flow?**
A: Frontend → Fetch API → Express Route → Mongoose Model → MongoDB → Response → Frontend Update

---

## 🎯 DEMO CHECKLIST

Before presenting:

- [ ] MongoDB running
- [ ] Backend started successfully
- [ ] Frontend opens without errors
- [ ] Test data created (3-4 donors, 2-3 requests)
- [ ] Can complete full user flow
- [ ] MongoDB Compass ready (optional)
- [ ] Code editor open with files visible
- [ ] Know location of key code sections

---

## 📞 EMERGENCY FIXES

### "Cannot connect to MongoDB"

```powershell
net start MongoDB
```

### "Port already in use"

Change PORT in `.env` to 5001

### "Module not found"

```powershell
cd backend
npm install
```

### "User already exists"

Use different email or delete from MongoDB

### Frontend not loading

Clear browser cache (Ctrl+Shift+Del)

---

## 🌟 PRESENTATION TIPS

1. **Start confident** - "This is a complete blood donation management system..."
2. **Show running application first** - Visual impact
3. **Explain as you demo** - Talk through each action
4. **Show code when asked** - Have files ready
5. **Be honest about limitations** - Shows understanding
6. **Know your data flow** - Most asked question
7. **Have backup plan** - If demo fails, explain with diagrams

---

## 📚 FILE LOCATIONS (For Quick Access)

### Most Important Files:

- Backend entry: `backend/server.js`
- User schema: `backend/models/User.js`
- Login API: `backend/routes/auth.js`
- Login page logic: `frontend/js/login.js`
- Main CSS: `frontend/css/style.css`

### Configuration:

- Environment: `backend/.env`
- Dependencies: `backend/package.json`

### Documentation:

- Full guide: `README.md`
- Viva prep: `VIVA_QUESTIONS.md`
- Setup guide: `RUNNING_GUIDE.md`

---

## ⏱️ TIME ESTIMATES

- Full setup: 15-20 minutes
- Backend start: 10 seconds
- Frontend open: 5 seconds
- Register user: 30 seconds
- Login: 10 seconds
- Search donors: 15 seconds
- Demo presentation: 10-15 minutes

---

## 🎓 FINAL CONFIDENCE BOOSTERS

✓ You've built a complete full-stack application
✓ You understand both frontend and backend
✓ You can explain the entire data flow
✓ You've solved a real-world problem
✓ Your code is clean and well-commented
✓ You have comprehensive documentation
✓ You're ready for any technical question

---

**Keep this card handy during your viva! 📱**

**You've got this! 💪**
