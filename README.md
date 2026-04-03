<div align="center">

# 🔵 Blue Ledger

### 💼 Advanced Portfolio Tracking for Indian Equities (NSE)

Track investments, analyze performance, and manage portfolios with real-time market data.

<br/>

![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue?style=for-the-badge\&logo=react)
![Node](https://img.shields.io/badge/Backend-Node%20%7C%20Express-green?style=for-the-badge\&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge\&logo=mongodb)
![Redis](https://img.shields.io/badge/Cache-Redis-red?style=for-the-badge\&logo=redis)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge\&logo=vercel)

</div>

---

## 🚀 Overview

**Blue Ledger** is a full-stack portfolio tracking system built for **Indian stock market investors**.
It provides real-time insights, portfolio analytics, and transaction management with a scalable backend and optimized data handling.

---

## ✨ Features

### 📊 Dashboard & Analytics

* Portfolio overview with real-time valuation
* Performance tracking with historical snapshots
* Interactive charts using Recharts

### 💼 Portfolio & Holdings

* Multiple portfolio support
* Detailed holdings breakdown
* Portfolio value history tracking

### 📝 Transactions Engine

* Add & manage buy/sell transactions
* Transaction history linked to holdings
* Automatic portfolio updates

### 📈 Market Data (NSE Focused)

* Live stock data integration (NSE)
* Historical price tracking
* Optimized fetching using Redis caching

### ⚡ Performance Optimization

* Redis caching (Upstash / local)
* Cached stock prices & computed portfolio data
* Faster API response times

### 🔐 Authentication System

* JWT authentication (HTTP-only cookies)
* Email OTP login
* Google OAuth login

### 📤 Export System

* Export portfolio data as:

  * CSV
  * JSON

### 🔔 User Experience

* Action-based notifications
* Fully responsive design
* Light/Dark mode support

---

## 🧠 Tech Stack

### Frontend

* React (Vite)
* React Router
* Axios
* Tailwind CSS
* Recharts
* Context API

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Joi Validation
* Winston Logger

### Infrastructure

* MongoDB (Atlas / Local)
* Redis (Upstash / Local via ioredis)
* Vercel (Frontend Deployment)

---

## 📂 Project Structure

```
Blue-Ledger/
│
├── backend/        # Express API (routes, services, models, cron jobs)
├── frontend/       # React (Vite) application
└── README.md
```

---

## ⚙️ Setup Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Priyank404/Blue-Ledger.git
cd Blue-Ledger
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_DB_URL=your_mongodb_url
JWT_SECRET_KEY=your_secret_key

GOOGLE_CLIENT_ID=your_google_client_id

EMAIL_USER=your_email
EMAIL_PASS=your_password

# Redis (choose one)
REDIS_PROVIDER=upstash
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token

# OR local Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

---

## 🔌 API Modules

All endpoints are prefixed with:

```
/api
```

### Available Modules:

* `/auth` → Authentication
* `/portfolio` → Portfolio management
* `/holdings` → Holdings tracking
* `/transaction` → Trade operations
* `/stock` → Market data
* `/dashboard` → Analytics
* `/export` → Data export
* `/users` → User settings

---

## 🔁 Application Flow

1. User authenticates (OTP / Google)
2. Adds buy/sell transactions
3. Backend processes and stores data
4. Redis caches computed results
5. Portfolio & holdings are calculated
6. Dashboard displays analytics
7. User exports or analyzes data

---

## 🌐 Live Demo

🔗 https://blue-legder.vercel.app/

---

## 👤 Author

**Priyank Khambhati**
GitHub: https://github.com/Priyank404

---

<div align="center">

### ⭐ Star the repo if you find it useful

</div>
