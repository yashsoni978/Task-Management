# TaskMaster

A modern, responsive, and robust full-stack Task Management application designed for productivity. Built meticulously using a powerful monorepo architecture. 

![Dashboard Screenshot](/docs/dashboard-placeholder.png)

## Live Deployment
- **Frontend (Vercel)**: [https://taskmaster-frontend-placeholder.vercel.app](https://taskmaster-frontend-placeholder.vercel.app)
- **Backend (Railway)**: [https://taskmaster-api-placeholder.railway.app](https://taskmaster-api-placeholder.railway.app)

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI, Radix UI
- **Forms & Validation**: React Hook Form, Zod
- **Icons**: Lucide React
- **HTTP Client**: Axios (w/ Interceptors)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Access & Refresh tokens)
- **Validation**: express-validator

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally

### 1. Clone the repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/taskmaster?schema=public"
JWT_ACCESS_SECRET="your-ultra-secure-access-secret"
JWT_REFRESH_SECRET="your-ultra-secure-refresh-secret"
```
Run Database Migrations & Start Server:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Start the application:
```bash
npm run dev
```

The application will now be running at `http://localhost:3000`.

---

## 🔌 API Endpoints Reference

All `/tasks` and `/auth/me` endpoints require a valid JWT Access Token passed in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| **POST** | `/auth/register` | No | Register a new user (`email`, `password`) |
| **POST** | `/auth/login` | No | Login and receive `accessToken` and `refreshToken` |
| **POST** | `/auth/refresh` | No | Exchange `refreshToken` for a new token pair |
| **POST** | `/auth/logout` | No | Invalidate a `refreshToken` |
| **GET**  | `/auth/me` | Yes | Get the currently authenticated user's profile |
| **GET**  | `/tasks` | Yes | Get paginated tasks (Query params: `page`, `limit`, `status`, `search`) |
| **POST** | `/tasks` | Yes | Create a new task |
| **GET**  | `/tasks/:id` | Yes | Retrieve a specific task securely by ID |
| **PATCH**| `/tasks/:id` | Yes | Update a task's fields (title, desc, status, priority, dueDate) |
| **DELETE**|`/tasks/:id` | Yes | Delete a specific task |
| **PATCH**| `/tasks/:id/toggle` | Yes | Cyclically toggle a task's status between states |

---
*Generated as part of the Phase 6 development cycle.*
