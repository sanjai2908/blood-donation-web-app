# Blood Donation Web Application

A production-oriented full-stack blood donation platform built with HTML, CSS, Bootstrap, JavaScript, Node.js, Express, MongoDB, and Mongoose. The app now includes JWT authentication, bcrypt password hashing, role-based access control, protected APIs, donor search, request management, and an admin dashboard.

## Features

### Authentication

- User registration
- User login and logout
- JWT-based sessions
- bcryptjs password hashing
- Protected routes and session-aware frontend guards

### Authorization

- Role-based access control
- Roles: `admin`, `donor`, `receiver`
- Middleware for authentication, donor access, receiver access, and admin access

### User Management

- Profile data with name, email, phone, city, blood group, role, availability status, and created date
- Profile update flow
- Admin user management

### Blood Requests

- Receiver request creation
- Receiver request history
- Donor request feed
- Donor accept/reject flow
- Admin request monitoring and status updates

### Search

- Search donors by blood group
- Search donors by city
- Filter donors by availability status

### Admin Dashboard

- Total donors
- Total receivers
- Total requests
- Available donors
- Recent requests
- User list and delete actions

## Project Structure

```text
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── requestController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── BloodRequest.js
│   └── User.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── donor.js
│   └── request.js
├── utils/
│   ├── AppError.js
│   ├── asyncHandler.js
│   └── jwt.js
└── server.js

root frontend entry pages/
├── index.html
├── login.html
├── register.html
├── donor-dashboard.html
├── receiver-dashboard.html
├── request-blood.html
├── admin-dashboard.html
└── profile.html

assets/
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── auth-login.js
    ├── auth-register.js
    ├── admin-dashboard-v2.js
    ├── donor-dashboard-v2.js
    ├── profile-v2.js
    ├── receiver-dashboard-v2.js
    └── request-blood-v2.js
```

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### Donors

- `GET /api/donors/search`
- `GET /api/donors/available`
- `GET /api/donor/requests`
- `PUT /api/donors/availability`

### Requests

- `POST /api/requests`
- `GET /api/requests/me`
- `GET /api/requests/donor`
- `GET /api/requests`
- `PUT /api/requests/:id/status`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/requests`

## Environment Variable Setup

Create a local `.env` file in `backend/` from `backend/.env.example`.

Development values should stay local and never be committed:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN`
- `NODE_ENV`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Production-specific guards:

- `ALLOW_ADMIN_CREATE=false`
- `ADMIN_RESET_CONFIRM=no`

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are required when you run the admin management scripts. Keep them in your local `.env` file or inject them through your deployment environment.

## Local Development Workflow

Run the backend from the `backend/` directory:

```bash
npm install
npm run dev
```

Serve the frontend over HTTP from the project root:

```bash
npx http-server . -p 5500
```

or:

```bash
python -m http.server 5500
```

Set `CLIENT_ORIGIN=http://localhost:5500` in `backend/.env` for local development.

Serving the frontend over HTTP is preferred because browsers treat `file://` pages as a `null` origin, which complicates CORS and can block authenticated requests before they reach the app.

The backend allows `null` origin only in development mode to support local testing, but that exception must never be enabled in production.

## Admin Management

The backend now uses environment-driven admin scripts.

Create the admin user:

```bash
cd backend
npm run create-admin
```

Reset the admin password:

```bash
cd backend
npm run reset-admin
```

Both scripts read `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment. In production, `create-admin` only runs when `ALLOW_ADMIN_CREATE=true`, and `reset-admin` requires `ADMIN_RESET_CONFIRM=yes`.

## Deployment Checklist

1. Set production environment variables on your host or deployment platform.
2. Use a strong, unique `JWT_SECRET`.
3. Keep `ADMIN_EMAIL` and `ADMIN_PASSWORD` out of source control and provision them only in the target environment.
4. Configure `CLIENT_ORIGIN` to match the deployed frontend domain.
5. Run `npm run create-admin` only during initial provisioning or controlled recovery.
6. Use HTTPS in production so JWT-bearing requests are protected in transit.
7. Confirm `npm run ci:check` passes before each release.

## Security Checklist

- Admin credentials are no longer hardcoded in the repo scripts.
- Recovery codes are generated server-side and hashed before storage.
- 2FA secrets are stored as private fields and excluded from JSON responses.
- Password confirmation is required before disabling 2FA or regenerating recovery codes.
- `.env` files are blocked by CI if they are committed.
- Do not commit production secrets, API keys, or credentials.

## Troubleshooting

- If login or registration fails with a CORS error, confirm the frontend is being served over HTTP and not opened directly from `file://`.
- If the browser origin is `null`, use `http://localhost:5500` for the frontend and set `CLIENT_ORIGIN` accordingly.
- If requests still fail, verify the backend is running, `CLIENT_ORIGIN` matches the frontend URL exactly, and the browser cache has been cleared.
- If you are testing from a file URL, remember that `null` origin support is development-only and should not be used in production.

## Production-Readiness Checklist

- `JWT_SECRET` is long, random, and different from development.
- `MONGODB_URI` points to the correct database for the environment.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set only in the target environment.
- `ALLOW_ADMIN_CREATE` is `false` in production unless you are provisioning on purpose.
- `ADMIN_RESET_CONFIRM` is `no` unless you are intentionally resetting credentials.
- HTTPS is enabled on the deployed frontend and backend.
- `.env` and other secret-bearing files are excluded from version control.
- The backend starts successfully with the production environment variables.
- Admin login, user login, and 2FA flows have been verified before release.
- Root checks pass with `npm run test`, `npm run lint`, and `npm run ci:check`.

## Notes

- The frontend uses `localStorage` to keep the JWT and the current user profile in sync.
- The backend protects routes with JWT verification and role middleware.
- The donor and receiver dashboards are separate views, and the profile page supports updating contact details and password.
