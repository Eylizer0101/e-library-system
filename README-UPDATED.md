# E-Library — refreshed warm brown & gold UI

## Changes
- Global Material UI theme and layout polish: coffee brown, cream, and gold.
- New responsive student signup design with **no OTP**. Public signup always creates a **student** account; admin registration by a public code has been removed.
- Server-side registration validation, normalized emails, duplicate handling, and configurable API/CORS.
- Original catalog, borrowing, return, and admin routes remain included.

## Run locally
1. In `backend`, copy `.env.example` to `.env`, configure MongoDB and set a strong `JWT_SECRET`. Run `npm install` then `npm start`.
2. In `frontend`, optionally copy `.env.example` to `.env`, run `npm install` then `npm start`.
3. Frontend: `http://localhost:3000`; backend health check: `http://localhost:5000/api/test`.

## Important
- Your original `node_modules` folders are intentionally excluded from this ZIP; reinstall with `npm install`.
- The original backend `.env` was intentionally omitted to avoid sharing database credentials or secrets.
- This package has not been end-to-end tested against your MongoDB instance. Configure the environment and verify the borrowing/return flows with a test database before deployment.
- Admin accounts must be provisioned through a trusted administrative process, not public self-registration.
- The existing forgot-password page references a backend endpoint not included in the original archive; configure a real email/reset flow before enabling that function for production.


## UI refresh (October 29, 2026)
Applied consistent chocolate brown, ivory and muted gold styling. Replaced the pale pink/peach homepage hero with a dark brown hero, improved button contrast, and normalized legacy accent colors across pages. OTP-free registration remains as in the supplied project.
