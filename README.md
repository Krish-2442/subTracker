# SubTracker — Personal Subscription & SaaS Manager

A full-stack MERN application for tracking and managing your subscriptions and SaaS spending.

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB/Mongoose (with aggregation pipelines)
- **Frontend:** React 19 (Vite), Tailwind CSS v4, Recharts, Lucide React

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB running locally (default: `mongodb://localhost:27017`)

### Backend

```bash
cd server
npm install
npm run dev
```

The API server starts on `http://localhost:5001` (configurable via `server/.env`).

### Frontend

```bash
cd client
npm install
npm run dev
```

The dev server starts on `http://localhost:5173`.

### Running Tests

```bash
cd server
npm test
```

## API Endpoints

### Authentication (Public & Protected)
| Method | Endpoint             | Access    | Description                          |
|--------|----------------------|-----------|--------------------------------------|
| POST   | `/api/auth/register` | Public    | Register new user & get JWT token    |
| POST   | `/api/auth/login`    | Public    | Login with email/password & get JWT  |

### Subscriptions (All Protected via Bearer JWT)
| Method | Endpoint                      | Description                                   |
|--------|-------------------------------|-----------------------------------------------|
| GET    | `/api/subscriptions`          | List user subscriptions (with search/filter)  |
| POST   | `/api/subscriptions`          | Create a new user subscription                |
| PUT    | `/api/subscriptions/:id`      | Update user subscription (ownership verified) |
| DELETE | `/api/subscriptions/:id`      | Delete user subscription (ownership verified) |
| GET    | `/api/subscriptions/summary`  | Get user spending summary & category data     |
| GET    | `/api/subscriptions/upcoming` | Get user renewals within 7 days               |
| GET    | `/api/health`                 | Health check                                  |

## Features

- **JWT Authentication:** Secure user registration, sign-in, and sign-out with bcrypt password hashing
- **User-Specific Dashboard:** Multi-user data isolation for subscriptions, spending totals, charts, and renewal alerts

- Full CRUD for subscriptions with client-side & server-side validation
- Automatic next billing date calculation (with month-end clamping)
- Cancelled subscriptions get `nextBillingDate` set to `null`
- Dashboard with monthly/annual spend and active count
- Donut chart for category-based spending breakdown (Recharts)
- Upcoming renewal alerts (next 7 days)
- **Search, filter, and sort** on the subscription table
- **Toast notifications** for all CRUD operations (success/error)
- **Skeleton loading** states matching the dashboard layout
- **Confirm-delete modal** instead of browser `window.confirm()`
- **Error state with retry** when API calls fail
- MongoDB aggregation pipeline for summary stats
- ObjectId validation middleware
- Global Express error-handling middleware
- Accessible modal (Escape key, ARIA attributes, scroll lock)
- Environment-variable-based API URL configuration
- Responsive dark-mode UI with custom scrollbar
