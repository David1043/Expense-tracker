# Expense Tracker

A simple full-stack application where users can register, log in, and manage their own expenses.

## Tech Stack

- Frontend: React, Vite, Bootstrap
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT and bcrypt

## Features

- User registration and login
- Add, view, edit, and delete personal expenses
- Filter expenses by category
- View total spending
- Protected dashboard and logout

## Prerequisites

- Node.js 22.12+ or a compatible newer supported LTS version
- npm
- A running local MongoDB server or a MongoDB Atlas connection

## Run Locally

Clone the repository and open the project folder:

```bash
git clone <repository-url>
cd expense-tracker
```

Replace `<repository-url>` with this repository's URL. If the cloned folder has a different name, use that name in the `cd` command.

### 1. Start the Server

```bash
cd server
npm install
```

Create a `.env` file inside `server` using the variables below. Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `JWT_SECRET`, then start the backend:

```bash
npm run dev
```

The server runs at `http://localhost:5000`.

### 2. Start the Client

Open a second terminal in the project root:

```bash
cd client
npm install
```

Create a `.env` file inside `client` using the variable below, then run:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. Keep both terminals running.

## Environment Variables

### Server — `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=replace_with_your_generated_secret
CLIENT_URL=http://localhost:5173
```

- `PORT`: Backend port.
- `MONGO_URI`: MongoDB connection string. Replace it with your Atlas URI if using Atlas.
- `JWT_SECRET`: Random signing secret of at least 32 characters. Replace the placeholder above with the generated value.
- `CLIENT_URL`: Frontend URL allowed by the backend.

### Client — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

- `VITE_API_URL`: Backend API base URL.

Do not commit `.env` files or real credentials. Restart the relevant development server after changing environment variables.

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Requires Token |
| --- | --- | --- | --- |
| POST | `/auth/register` | Register a user | No |
| POST | `/auth/login` | Log in and receive a JWT | No |
| GET | `/auth/me` | Get the logged-in user | Yes |
| GET | `/expenses` | Get your expenses | Yes |
| POST | `/expenses` | Add an expense | Yes |
| PUT | `/expenses/:id` | Update your expense | Yes |
| DELETE | `/expenses/:id` | Delete your expense | Yes |

For protected endpoints, send:

```text
Authorization: Bearer <token>
```

Send JSON request bodies with `Content-Type: application/json`.

Registration requires `name`, `email`, and `password`. Login requires `email` and `password`.

For adding or updating an expense, send all editable fields; `note` is optional:

```json
{
  "title": "Lunch",
  "amount": 250,
  "category": "Food",
  "date": "2026-10-13",
  "note": "Office lunch"
}
```

Allowed categories: Food, Travel, Shopping, Bills, Health, Other. Amounts are in INR, must be positive, and support up to two decimal places. Each user can access only their own expenses.
