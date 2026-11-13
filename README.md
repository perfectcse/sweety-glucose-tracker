# Sweety – Blood Glucose Tracker

A full-stack blood glucose tracking application built using React, Node.js, Express, PostgreSQL, and Prisma.

## Features

### Authentication
- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- User-specific reading access

### Glucose Readings
- Create, read, update, and delete readings
- Four daily reading slots:
  - Morning (Fasting)
  - After Breakfast
  - After Lunch
  - After Dinner
- Glucose validation: 40–600 mg/dL
- One reading per slot per day
- Maximum four readings per day
- Future dates are not allowed

### Reports
- Daily glucose report
- Current-month report
- Previous-month report
- Highest, lowest, average, and total readings
- Daily reading breakdown

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Password Security | bcrypt |
| HTTP Client | Axios |

## Project Structure

```text
sweety-glucose-tracker/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── styles/
│   └── package.json
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js
- npm
- PostgreSQL

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/perfectcse/sweety-glucose-tracker.git
cd sweety-glucose-tracker
```

### 2. Backend installation

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure:
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- PORT

### 3. Database setup

Create a PostgreSQL database named `sweety_db`.

Run:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Seed demo data

```bash
npm run seed
```

Demo credentials:

- Email: demo@sweetytracker.com
- Password: DemoPass123!

These credentials are for local demonstration only.

### 5. Start the backend

```bash
npm run dev
```

Backend URL: http://localhost:5000

### 6. Frontend installation

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## API Documentation

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |

### Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/readings | Create reading |
| GET | /api/readings | Get user readings |
| PUT | /api/readings/:id | Update reading |
| DELETE | /api/readings/:id | Delete reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/daily | Daily report |
| GET | /api/reports/current-month | Current-month report |
| GET | /api/reports/previous-month | Previous-month report |

Protected endpoints require a Bearer JWT token.

## Validation Rules

- Values must be whole numbers between 40 and 600 mg/dL.
- Only four predefined reading slots are accepted.
- Duplicate readings for the same user, date, and slot are rejected.
- Future dates are rejected.
- Each user can access only their own readings.

## Assumptions and Future Improvements

### Assumptions
- Each user can record up to four readings per day.
- Each reading belongs to one of four predefined slots.
- Glucose values are stored in mg/dL.
- Reports are calculated for the authenticated user.

### Future Improvements
- Glucose trend charts
- Pagination
- PDF and CSV report exports
- Reminder notifications
- Automated frontend and backend tests

## Security

- Passwords are hashed using bcrypt.
- JWT authentication protects private API endpoints.
- Reading queries are scoped to the authenticated user.
- Environment secrets are excluded from Git.

## Author

Developed as a full-stack application assignment.

---

**Sweety – Blood Glucose Tracker**

