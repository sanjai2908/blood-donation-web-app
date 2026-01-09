# 🚀 STEP-BY-STEP RUNNING GUIDE

## Blood Donation Web Application

---

## 📋 PREREQUISITES CHECK

Before starting, ensure you have:

- ✅ Node.js installed (v14 or higher)
- ✅ MongoDB installed OR MongoDB Atlas account
- ✅ VS Code (or any code editor)
- ✅ A web browser (Chrome, Firefox, Edge)
- ✅ Internet connection (for Bootstrap/Font Awesome CDN)

---

## 🔧 STEP 1: INSTALL MONGODB

### Option A: Local MongoDB (Recommended for beginners)

1. **Download MongoDB Community Server:**

   - Go to: https://www.mongodb.com/try/download/community
   - Select your OS (Windows)
   - Download the MSI installer

2. **Install MongoDB:**

   - Run the downloaded .msi file
   - Choose "Complete" installation
   - Keep "Install MongoDB as a Service" checked
   - Click Install

3. **Verify Installation:**
   Open PowerShell and run:

   ```powershell
   mongod --version
   ```

   You should see version information.

4. **Start MongoDB:**
   MongoDB should start automatically as a service.
   If not, run:
   ```powershell
   net start MongoDB
   ```

### Option B: MongoDB Atlas (Cloud - Free Tier)

1. **Create Account:**

   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster:**

   - Choose "Free Shared" tier
   - Select a cloud provider (AWS recommended)
   - Choose region closest to you
   - Click "Create Cluster"

3. **Setup Database Access:**

   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Give "Read and write to any database" permission

4. **Setup Network Access:**

   - Go to "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String:**

   - Go to "Database" in left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://username:password@cluster0.abc123.mongodb.net/blood-donation`

6. **Update .env file:**
   Open `backend/.env` and replace:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/blood-donation
   ```

---

## 🎯 STEP 2: VERIFY YOUR PROJECT STRUCTURE

Your folder should look like this:

```
Pro Blood/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── BloodRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donor.js
│   │   └── request.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── admin-dashboard.js
│   │   ├── donor-dashboard.js
│   │   ├── login.js
│   │   ├── register.js
│   │   └── request-blood.js
│   ├── admin-dashboard.html
│   ├── donor-dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── request-blood.html
├── README.md
└── VIVA_QUESTIONS.md
```

---

## 💻 STEP 3: START THE BACKEND

### Open Terminal in VS Code:

Press `` Ctrl + ` `` (backtick key) or go to Terminal → New Terminal

### Navigate to backend folder:

```powershell
cd backend
```

### Install dependencies (if not already done):

```powershell
npm install
```

Wait for all packages to download. You should see:

```
added 85 packages
```

### Start the server:

```powershell
node server.js
```

### ✅ Expected Output:

```
✅ Connected to MongoDB successfully
🚀 Server is running on port 5000
📡 API available at http://localhost:5000
```

### ❌ If you see error:

- **"Cannot connect to MongoDB"**:

  - Check if MongoDB service is running
  - Check connection string in `.env` file
  - If using Atlas, check network access settings

- **"Port 5000 is already in use"**:
  - Change PORT in `.env` to 5001 or another free port
  - Update API_URL in all frontend JS files

---

## 🌐 STEP 4: START THE FRONTEND

### Method 1: Using Live Server (Recommended)

1. **Install Live Server Extension in VS Code:**

   - Click Extensions icon (or Ctrl+Shift+X)
   - Search for "Live Server"
   - Click Install on "Live Server by Ritwick Dey"

2. **Start Live Server:**
   - Open `frontend/index.html` in VS Code
   - Right-click anywhere in the file
   - Click "Open with Live Server"
   - Browser will open automatically at `http://127.0.0.1:5500/frontend/index.html`

### Method 2: Direct Browser Open

1. **Navigate to frontend folder:**

   ```powershell
   cd ../frontend
   ```

2. **Open in default browser:**

   ```powershell
   start index.html
   ```

3. **Or manually:**
   - Open File Explorer
   - Navigate to `D:\Pro Blood\frontend`
   - Double-click `index.html`

---

## 🧪 STEP 5: TEST THE APPLICATION

### Test 1: Home Page

- You should see the landing page with:
  - Blood Donation System logo
  - Hero section with "Save Lives, Donate Blood"
  - Three feature cards
  - Statistics section

### Test 2: Register as Donor

1. **Click "Register" in navigation bar**

2. **Fill the form:**

   - Name: John Doe
   - Email: john@example.com
   - Password: test123
   - Phone: 9876543210
   - City: Mumbai
   - Select: "Donor"
   - Blood Group: O+
   - Age: 25
   - Check "I am available to donate blood"

3. **Click "Register Now"**

4. **✅ Expected:** Success message + redirect to login page

### Test 3: Login as Donor

1. **Enter credentials:**

   - Email: john@example.com
   - Password: test123

2. **Click "Login"**

3. **✅ Expected:** Redirect to Donor Dashboard

4. **Verify Dashboard:**
   - Shows your name in navbar
   - Profile card displays all your details
   - Blood Group shows O+
   - Availability toggle is ON

### Test 4: Update Availability

1. **In Donor Dashboard, toggle the switch OFF**

2. **✅ Expected:** Badge changes from "Available" to "Not Available"

3. **Toggle back ON**

### Test 5: Register as Receiver

1. **Logout (click Logout in navbar)**

2. **Go to Register page**

3. **Fill the form:**

   - Name: City Hospital
   - Email: hospital@example.com
   - Password: test123
   - Phone: 1234567890
   - City: Mumbai
   - Select: "Receiver"
   - (Notice: Blood Group and Age fields hide automatically)

4. **Click "Register Now"**

### Test 6: Request Blood

1. **Login as Receiver:**

   - Email: hospital@example.com
   - Password: test123

2. **You'll be on Request Blood page**

3. **Fill the form:**

   - Blood Group Needed: O+
   - City: Mumbai

4. **Click "Find Donors"**

5. **✅ Expected:**

   - Shows "Found 1 matching donors" message
   - Displays John Doe's details
   - Shows phone number and email buttons

6. **Test with no matches:**
   - Blood Group: AB-
   - City: Delhi
   - Should show "No Donors Found" message

### Test 7: Admin Dashboard

1. **Logout**

2. **Create Admin User (Two ways):**

   **Option A: Quick Login on Login Page:**

   - Go to login page
   - Click "Login as Admin" button
   - (This will use test credentials if admin exists)

   **Option B: Register Admin Manually:**

   - Register like normal user
   - In form, temporarily change role in code to 'admin'
   - Or use MongoDB Compass to change role field

3. **Login as Admin:**

   - Email: admin@gmail.com
   - Password: admin@123

4. **✅ Expected - Admin Dashboard shows:**
   - Statistics cards:
     - Total Donors: 1
     - Total Requests: 1 (or more if you tested multiple times)
     - Available Donors: 1
     - Pending Requests: 1
   - Table of all donors
   - Table of all blood requests

---

## 🔍 STEP 6: VERIFY IN MONGODB

### Option 1: MongoDB Compass (GUI)

1. **Download and Install:**

   - Go to: https://www.mongodb.com/try/download/compass
   - Download and install

2. **Connect:**

   - Open Compass
   - Connection String: `mongodb://localhost:27017`
   - Click Connect

3. **View Data:**
   - Click "blood-donation" database
   - Click "users" collection
   - You should see your registered users
   - Click "bloodrequests" collection
   - You should see blood requests

### Option 2: MongoDB Shell (Command Line)

```powershell
# Start Mongo shell
mongosh

# Use the database
use blood-donation

# View all users
db.users.find().pretty()

# View all requests
db.bloodrequests.find().pretty()

# Count documents
db.users.countDocuments()
db.bloodrequests.countDocuments()

# Exit
exit
```

---

## 📝 STEP 7: CREATE TEST DATA FOR DEMO

Run these scenarios to have good demo data:

### Scenario 1: Multiple Donors Different Blood Groups

Register 5 donors with:

1. A+ in Mumbai
2. O+ in Delhi
3. B+ in Mumbai
4. AB+ in Pune
5. O- in Mumbai

### Scenario 2: Multiple Blood Requests

As receiver, request blood:

1. O+ in Mumbai
2. A+ in Delhi
3. B+ in Bangalore

This will create variety in admin dashboard for good presentation.

---

## 🐛 TROUBLESHOOTING COMMON ISSUES

### Issue 1: Backend won't start

**Error:** `Cannot find module 'express'`
**Solution:**

```powershell
cd backend
npm install
```

### Issue 2: MongoDB connection failed

**Error:** `MongoServerError: connect ECONNREFUSED`
**Solution:**

- Check if MongoDB service is running:
  ```powershell
  net start MongoDB
  ```
- Or restart it:
  ```powershell
  net stop MongoDB
  net start MongoDB
  ```

### Issue 3: Frontend can't reach backend

**Error:** "Failed to fetch" in browser console
**Solution:**

- Make sure backend is running (`node server.js`)
- Check backend terminal for errors
- Verify API_URL in frontend JS files is `http://localhost:5000/api`

### Issue 4: Registration fails

**Error:** "User already exists"
**Solution:**

- Use a different email address
- Or delete existing user from MongoDB

### Issue 5: Login doesn't redirect

**Check these:**

- Open browser Developer Tools (F12)
- Go to Console tab
- Look for errors
- Check Application tab → Local Storage → userData

### Issue 6: No donors found even though they exist

**Check:**

- City spelling matches exactly (case-insensitive but spelling matters)
- Blood group matches exactly
- Donor's availability is set to TRUE
- Donor is registered in same city

---

## ✅ PRE-VIVA CHECKLIST

Before presenting to examiner:

- [ ] Backend starts without errors
- [ ] MongoDB connection successful
- [ ] Frontend opens in browser
- [ ] Can register new donor
- [ ] Can login as donor
- [ ] Donor dashboard shows correctly
- [ ] Can update availability
- [ ] Can register as receiver
- [ ] Can search and find donors
- [ ] Admin dashboard shows all data
- [ ] Have test data ready (3-4 donors, 2-3 requests)
- [ ] MongoDB Compass installed (to show database)
- [ ] Know your MongoDB connection string
- [ ] Code editor ready with files open
- [ ] Browser DevTools ready to show localStorage
- [ ] Practiced explaining the flow

---

## 🎥 DEMO FLOW FOR VIVA

**Recommended presentation order:**

1. **Start with folder structure explanation (2 min)**

   - Show backend folder
   - Show frontend folder
   - Explain separation of concerns

2. **Start backend (1 min)**

   - Open terminal
   - `cd backend`
   - `node server.js`
   - Point out success messages

3. **Show Home Page (1 min)**

   - Open frontend/index.html
   - Highlight features

4. **Donor Registration & Dashboard (3 min)**

   - Register new donor
   - Login
   - Show dashboard
   - Toggle availability
   - Show localStorage in browser DevTools

5. **Receiver Flow (3 min)**

   - Register as receiver
   - Request blood
   - Show matching donors
   - Explain matching logic

6. **Admin Dashboard (2 min)**

   - Login as admin
   - Show statistics
   - Show all donors table
   - Show all requests table

7. **Show MongoDB Data (2 min)**

   - Open MongoDB Compass
   - Show users collection
   - Show bloodrequests collection

8. **Code Walkthrough (5 min)**

   - Open server.js - explain Express setup
   - Open User.js - explain schema
   - Open auth.js - explain API endpoint
   - Open login.js - explain frontend logic

9. **Q&A Ready (remaining time)**
   - Have VIVA_QUESTIONS.md open for reference

---

## 📞 GETTING HELP

If you encounter issues not covered here:

1. **Check error message carefully**
2. **Google the exact error**
3. **Check if backend is running**
4. **Check browser console for errors**
5. **Restart both backend and browser**
6. **Check MongoDB is running**

---

## 🎯 SUCCESS CRITERIA

Your application is working correctly when:

- ✅ Backend starts without errors
- ✅ MongoDB connects successfully
- ✅ Can register and login users
- ✅ Can see data in MongoDB
- ✅ Blood matching returns correct donors
- ✅ Admin can see all data
- ✅ No console errors in browser
- ✅ All features work as expected

---

## 🌟 FINAL TIPS

1. **Always start backend first, then frontend**
2. **Keep backend terminal visible during demo**
3. **Have backup test data ready**
4. **Practice the flow at least 3 times before viva**
5. **Be ready to explain ANY part of the code**
6. **Have MongoDB Compass ready to show database**
7. **Be honest about limitations and future improvements**

---

**You're all set! Good luck with your presentation! 🎓**
