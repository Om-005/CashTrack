# CashTrack Backend API

Node.js + Express + MongoDB REST API for the CashTrack mobile expense tracker.

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)

### 2. MongoDB Atlas Setup (if you don't have a cluster)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up
2. Click **"Build a Cluster"** → select **Free Tier (M0)**
3. Choose a cloud provider/region close to you
4. Wait for the cluster to be created
5. Go to **Database Access** → Add a new user with username/password
6. Go to **Network Access** → Add `0.0.0.0/0` (allows all IPs — for development)
7. Go to **Clusters** → Click **"Connect"** → Choose **"Connect your application"**
8. Copy the connection string (looks like `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cashtrack`)

### 3. Environment Setup

```bash
# Copy the env template
copy .env.example .env

# Edit .env with your values:
# PORT=5000
# MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cashtrack
# JWT_SECRET=any_random_string_make_it_long_and_unique
```

### 4. Install & Run

```bash
# Install dependencies (already done if you ran npm install)
npm install

# Start in development mode (with auto-reload)
npm run dev

# Start in production mode
npm start
```

The server will start at `http://localhost:5000`.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile (auth required) |

### Expenses (all require JWT auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses` | Add expense (today only) |
| POST | `/api/expenses/missing` | Add missing entry (past dates only) |
| GET | `/api/expenses` | Get all expenses (supports filters) |
| GET | `/api/expenses/:id` | Get single expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Analytics (all require JWT auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/dashboard` | Dashboard stats (totals, top category, recent) |
| GET | `/api/expenses/analytics/monthly?year=2026` | Monthly totals for a year |
| GET | `/api/expenses/analytics/category?month=5&year=2026` | Category breakdown |
| GET | `/api/expenses/analytics/daily` | Last 7 days trend |
| GET | `/api/expenses/analytics/yearly` | Yearly summary |

### Query Parameters for GET /api/expenses
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `category` | String | `Food & Dining` | Filter by category |
| `month` | Number | `5` | Filter by month (1-12) |
| `year` | Number | `2026` | Filter by year |
| `search` | String | `coffee` | Search in descriptions |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response:
{
  "success": true,
  "token": "eyJhbGciOiJI...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

**Add Expense:**
```json
POST /api/expenses
Authorization: Bearer <token>
{
  "category": "Food & Dining",
  "description": "Lunch at restaurant",
  "amount": 350,
  "date": "2026-05-22",
  "time": "13:30",
  "paymentMethod": "UPI",
  "notes": "Team lunch"
}
```
