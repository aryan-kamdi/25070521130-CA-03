# FLEXI Movie Watchlist & Review Hub

> College CA3 Full-Stack Web Application Project

An end-to-end, full-stack movie curation, review, and watchlist web platform built with a high-performance MERN architecture (React + Vite, Node.js, Express.js, MongoDB). Features a cinematic dark theme, JWT authentication, role-based access control (Admin/User), live search and filtering, star ratings, interactive review management, and full movie CRUD administration.

---

## 📽️ Tech Stack

- **Frontend**: React.js (Vite), React Router v6, Axios, Custom Plain CSS (no external component library)
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB (Local instance at `mongodb://127.0.0.1:27017/flexi_movies`, viewable in MongoDB Compass)
- **Authentication**: JSON Web Token (JWT) + bcryptjs password hashing

---

## 📁 Project Structure

```text
25070521130/
├── client/                     # React + Vite Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── api/                # Axios instance & token interceptors
│   │   ├── components/         # Navbar, MovieCard, StarRating, ReviewForm, Modal, etc.
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── pages/              # Login, Home, MovieDetails, Watchlist, Admin, 404
│   │   ├── App.jsx             # Main routes & protected route tree
│   │   ├── index.css           # Cinematic dark theme styling & responsive grid
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── vite.config.js          # Configured for port 5173
│   ├── package.json
│   └── .gitignore
│
├── server/                     # Express.js REST API Backend
│   ├── config/                 # Mongoose database connection
│   ├── controllers/            # Auth, Movies, Reviews, Watchlist controllers
│   ├── middleware/             # JWT protect & admin-role verification
│   ├── models/                 # User, Movie, Review Mongoose schemas
│   ├── routes/                 # Express API router files
│   ├── .env                    # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example            # Environment template
│   ├── seed.js                 # Database seeder (14 movies, admin & user accounts, sample reviews)
│   ├── server.js               # Main Express server entry point (port 5000)
│   ├── package.json
│   └── .gitignore
│
├── README.md                   # Complete documentation & instructions
└── .gitignore                  # Global git ignores
└── package.json                # Root scripts to run client & server
```

---

## ⚙️ Prerequisites

Before launching the project:
1. **Node.js** (v18 or higher recommended)
2. **MongoDB** installed and running locally:
   - Make sure the MongoDB service is active (`mongodb://127.0.0.1:27017`).
   - You can connect **MongoDB Compass** to `mongodb://127.0.0.1:27017`. The database `flexi_movies` will show up once the seed script runs.

---

## 🚀 Setup & Execution Guide

Open two terminal windows (one for `server`, one for `client`):

### Step 0: Create Environment File

```bash
# Inside the server/ directory, copy the example env file
cd server
copy .env.example .env
```

The default `.env` values work out-of-the-box with a local MongoDB instance.

---

### Terminal 1: Backend Server

### Terminal 1: Backend Server

```bash
# 1. Navigate into server directory
cd server

# 2. Install backend dependencies
npm install

# 3. Seed the database with 14 curated movies & demo users
npm run seed

# 4. Start the backend in development mode (runs with nodemon on port 5000)
npm run dev
```

The server will start at: `http://localhost:5000`

---

### Terminal 2: Frontend Client

```bash
# 1. Navigate into client directory
cd client

# 2. Install frontend dependencies
npm install

# 3. Start the Vite development server (port 5173)
npm run dev
```

The client will start at: `http://localhost:5173`

---

## 🔑 Demo & Grading Credentials

The seed script (`npm run seed`) automatically seeds the following accounts into `flexi_movies`:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@flexi.com` | `Admin@123` | Full access: View, Add/Edit/Delete movies, Review, Watchlist |
| **Student / User** | `aryan@flexi.com` | `Aryan@123` | Standard user: View, Review, Watchlist |

> **Quick Tip**: On the `/login` page, there are one-click demo fill buttons to test both roles effortlessly!

---

## 📡 API Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (returns JWT & user payload) |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Private | Verify current user session |

### 2. Movies (`/api/movies`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Public | Retrieve movies with `?q=` search & `?genre=` filter |
| `GET` | `/api/movies/:id` | Public | Get movie details, calculated average rating & reviews |
| `POST` | `/api/movies` | Admin Only | Add a new movie to catalog |
| `PUT` | `/api/movies/:id` | Admin Only | Update existing movie details |
| `DELETE` | `/api/movies/:id` | Admin Only | Delete movie, associated reviews, and watchlist entries |

### 3. Reviews (`/api/reviews` & `/api/movies/:id/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/movies/:id/reviews` | Private | Add or update a review (1-5 stars & comment) |
| `PUT` | `/api/reviews/:id` | Private | Edit user's own review |
| `DELETE` | `/api/reviews/:id` | Private | Delete user's own review (or Admin) |

### 4. Watchlist (`/api/watchlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/watchlist` | Private | Get current user's saved movies |
| `POST` | `/api/watchlist/:movieId` | Private | Add movie to user's watchlist |
| `DELETE` | `/api/watchlist/:movieId` | Private | Remove movie from user's watchlist |

---

## ✅ Feature Verification Checklist

1. [x] **Authentication Flow**:
   - Visit `/login`, register a new user or sign in with `admin@flexi.com` / `Admin@123`.
   - Token is stored in `localStorage` and sent via Axios request interceptor.
   - Unauthenticated visits to `/`, `/movie/:id`, `/watchlist`, `/admin` automatically redirect to `/login`.
   - Logging out clears session and redirects to `/login`.

2. [x] **Home Page & Movie Catalog**:
   - Displays 14 seeded movies with high-resolution posters, genres, years, and average ratings.
   - Search box provides live search by movie title and synopsis without page reload.
   - Genre filter dropdown filters by Action, Sci-Fi, Drama, Animation, Crime, etc.
   - Sort dropdown sorts by rating, release year, or title.

3. [x] **Movie Details & Reviews**:
   - Click any movie card to navigate to `/movie/:id`.
   - Shows synopsis, genre tag, release year, and aggregated audience rating.
   - Submit a review with 1 to 5 stars and comment.
   - Edit or delete your own review; ratings re-aggregate dynamically.
   - Click "Add to Watchlist" / "Remove from Watchlist" button.

4. [x] **Watchlist Management**:
   - Navigate to `/watchlist` via the navbar.
   - Displays all movies saved by the logged-in user.
   - Remove movies directly with a single click.
   - Shows empty state when no films are saved.

5. [x] **Admin Panel (`/admin`)**:
   - Visible only when logged in as `admin@flexi.com` (non-admin users are blocked).
   - Displays catalog metrics (total films, distinct genres, total reviews, catalog average rating).
   - Click "➕ Add New Movie" to create a movie using the modal form.
   - Click "Edit" to modify any existing movie.
   - Click "Delete" to remove a movie with confirmation dialog.

6. [x] **Database Verification in MongoDB Compass**:
   - Open MongoDB Compass and connect to `mongodb://127.0.0.1:27017`.
   - Database `flexi_movies` contains three populated collections: `users`, `movies`, `reviews`.

