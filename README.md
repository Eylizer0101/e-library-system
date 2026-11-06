<div align="center">

# E-Library Management System

### A web-based platform for managing library books, borrowing requests, and student access

**A full-stack library platform for students and administrators.**

![Stack](https://img.shields.io/badge/Stack-MERN-2e66a6?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React-149eca?style=flat-square)
![Material UI](https://img.shields.io/badge/UI-Material%20UI-007FFF?style=flat-square)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square)

[Overview](#overview) · [Features](#features) · [Tech Stack](#tech-stack) · [Installation](#getting-started) · [API](#api-overview) · [Developer](#developer)

</div>

---

## Overview

The **E-Library Management System** is a full-stack web application designed to help students discover books, submit borrowing requests, and track their library activity while providing administrators with tools to manage the book catalog, borrowing requests, and library records.

The application separates **Student** and **Administrator** workflows and connects a React-based frontend to a REST API backed by MongoDB.

### Project Goals

- Make it easier for students to find and request available library books.
- Replace scattered manual borrowing records with centralized digital records.
- Help administrators organize book details, available copies, and borrowing activity.
- Provide a responsive interface across desktop and smaller screens.

## Features

### Student

- **Account registration and login** using student information and email/password credentials.
- **Book catalog** with search, category filtering, and pagination support.
- **Book details** and availability information.
- **Borrowing requests** for books with available copies.
- **My borrowing activity** to review submitted requests and their statuses.
- **Return workflow** for approved borrowed books.
- **Profile and account-related pages** for student information.

### Administrator

- **Book management:** create, view, update, and delete catalog entries.
- **Book cover uploads:** attach an image to a book record.
- **Inventory tracking:** maintain total and available book copies.
- **Borrowing request management:** review, approve, or reject requests.
- **Borrowing records:** monitor statuses and returned books.
- **Administrative access controls** for protected operations.

> Feature availability in the interface may vary by the current frontend implementation. The core catalog, borrowing, authentication, and admin routes are present in the repository.

## How It Works

1. A student registers or signs in to an existing account.
2. The student explores the catalog and filters or searches for a book.
3. If copies are available, the student submits a borrowing request.
4. An administrator reviews the request and approves or rejects it.
5. On approval, the system adjusts the available-copy count.
6. When an approved book is returned through the supported workflow, the record is updated and the available-copy count is restored.

**Borrowing safeguards:** the backend checks available copies and prevents a student from submitting another active request for the same book.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, React Router, Material UI 7, Emotion |
| API integration | Axios |
| Charts and visualization | Recharts |
| Backend | Node.js, Express.js 4 |
| Database | MongoDB, Mongoose 7 |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| File uploads | Multer |
| Configuration | dotenv, CORS |
| Development tools | Git, GitHub, npm, Nodemon |

## Repository Structure

```text
e-library-system/
├── backend/
│   ├── middleware/         # Authentication and authorization
│   ├── models/             # MongoDB / Mongoose data models
│   ├── routes/             # REST API endpoints
│   ├── uploads/            # Uploaded book images (runtime)
│   ├── .env.example        # Backend environment template
│   ├── package.json
│   └── server.js           # Express application entry point
├── frontend/
│   ├── public/             # Static assets
│   ├── src/                # React application source
│   ├── .env.example        # Frontend environment template
│   └── package.json
├── .gitignore
├── README-UPDATED.md      # Earlier UI-change notes
└── README.md              # Main project documentation
```

*The tree highlights major components rather than listing every source file.*

## Getting Started

### Prerequisites

Before running the project, install:

- **Node.js and npm** (a currently supported Node.js LTS release is recommended).
- **MongoDB** locally, or a MongoDB Atlas database.
- **Git** to clone the repository.

### 1. Clone the repository

```bash
git clone https://github.com/Eylizer0101/e-library-system.git
cd e-library-system
```

### 2. Configure and start the backend

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` using `.env.example` as the template:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/e-library
JWT_SECRET=replace_this_with_a_long_random_secret
FRONTEND_URL=http://localhost:3000
```

**Important:** replace the example secret before running the application. For MongoDB Atlas, replace `MONGODB_URI` with your own database connection string. Never commit actual passwords, connection strings, or JWT secrets.

Start the backend:

```bash
npm start
```

For development with Nodemon:

```bash
npm run dev
```

By default, the API listens at `http://localhost:5000`.

### 3. Configure and start the frontend

Open a **second terminal** from the repository root:

```bash
cd frontend
npm install
```

The frontend includes an `.env.example` for its backend URL. For local development, create `frontend/.env` with:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

This overrides the example's placeholder hosted backend URL.

Start the React development server:

```bash
npm start
```

Open `http://localhost:3000` in your browser.

### 4. Verify the connection

Visit the backend test endpoint:

```text
http://localhost:5000/api/test
```

A working API should respond with a JSON message indicating that the API is working. Then test student registration, login, catalog browsing, and the borrowing workflow with test data.

## API Overview

The Express application mounts these route groups:

| Base path | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, and authentication-related requests |
| `/api/books` | Book catalog, book details, category listing |
| `/api/borrow` | Borrowing requests, approvals, rejections, and returns |
| `/api/admin` | Administrator-only catalog and management operations |
| `/api/users` | User-related requests |
| `/api/test` | Basic API health check |

**Examples of confirmed endpoints:**

```http
GET  /api/books
GET  /api/books?search=history&category=all&page=1&limit=12
POST /api/auth/register
POST /api/auth/login
POST /api/borrow/request
PUT  /api/borrow/:id/approve
PUT  /api/borrow/:id/reject
PUT  /api/borrow/:id/return
POST /api/admin/books
PUT  /api/admin/books/:id
DELETE /api/admin/books/:id
```

Protected endpoints require the appropriate authentication or administrator permissions. See the route files in `backend/routes/` for exact request fields and responses.

## Authentication and Security

The current codebase includes:

- Password handling using **bcryptjs** through the user model.
- **JWT-based authentication** for protected actions.
- Separate authorization middleware for administrative endpoints.
- Registration validation, duplicate-account checks, and normalized email values.
- Configurable CORS origins through `FRONTEND_URL`.
- File upload restrictions for admin book images (image MIME types and a 5 MB size limit).

### Security considerations before production

- Keep `.env` files and credentials outside version control.
- Use a strong, unique `JWT_SECRET` and protect database credentials.
- Provision administrator accounts through a trusted process; public registration creates student accounts.
- Review authentication and authorization on every sensitive endpoint.
- Configure HTTPS, backups, error monitoring, and persistent image storage before public deployment.
- Validate the complete borrowing lifecycle and concurrency behavior with realistic test cases.

> The existing project notes indicate the forgot-password interface does not yet have a complete supporting backend reset flow. Do not present password reset as production-ready until implemented and tested.

## Testing and Validation

Recommended manual tests:

1. Register a valid student account and reject invalid or duplicate details.
2. Log in with correct credentials and reject incorrect passwords.
3. Search and filter books; check pagination and empty results.
4. Submit a borrowing request for an available book.
5. Attempt a duplicate request for the same book.
6. Attempt to request a book with zero available copies.
7. Approve and reject pending requests as an administrator.
8. Verify available-copy counts after approvals and returns.
9. Confirm a student cannot access administrator-only operations.
10. Upload valid and invalid book cover files.

The repository was reviewed for documentation purposes; this README does **not** claim that automated or end-to-end tests have passed.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| Backend cannot connect to MongoDB | Check MongoDB service/Atlas access, `MONGODB_URI`, and network permissions. |
| Registration or login fails | Confirm the backend is running, MongoDB is connected, and `JWT_SECRET` is set. |
| Frontend cannot reach API | Check `REACT_APP_API_URL`, backend port, and `FRONTEND_URL` CORS setting. Restart React after editing `.env`. |
| Book images do not appear | Check uploaded-image URLs, `uploads/` file availability, and persistent storage after deployment. |
| A borrow request fails | Check copies available, duplicate pending/approved requests, and logged-in session. |
| Port already in use | Change the backend `PORT` or stop the conflicting process. |

## Deployment Notes

The React frontend and Express backend can be deployed separately. Configure the frontend API URL to point to the deployed backend's `/api` endpoint and set `FRONTEND_URL` on the backend to the deployed frontend origin.

For production, provide a reachable MongoDB instance, use HTTPS, and arrange persistent storage for uploaded book images. Do not rely on temporary application disk storage for important uploads.

No verified live production URL is included in this README.

## Developer

**Eylizer De Afria**  
Bachelor of Science in Information Technology, major in System Development  
PHINMA Araullo University

- **Portfolio:** https://eylizer-portfolio.onrender.com
- **GitHub:** https://github.com/Eylizer0101
- **LinkedIn:** https://www.linkedin.com/in/eylizer-de-afria-040724430

## License

© 2026 Eylizer De Afria. All Rights Reserved.

This project is provided publicly for educational, portfolio, viewing, and evaluation purposes only. **No permission is granted to copy, modify, redistribute, sublicense, or use the project commercially** without prior written permission from the relevant copyright holder(s).

Public availability on GitHub does not make the project open source. Any license field in a `package.json` file should not be interpreted as a repository-wide permission grant. Third-party libraries, assets, and contributions remain subject to their own licenses and ownership rights.

For permission inquiries, contact the repository owner through GitHub.

---

<div align="center">

**E-Library Management System**  
*Making library discovery and borrowing management more organized and accessible.*

</div>
