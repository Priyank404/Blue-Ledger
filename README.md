# 📊 Blue Ledger

A full-stack **Blue Ledger** web application that helps users manage, track, and analyze their investment portfolio.
Built with a modern **frontend + backend** architecture following real-world production practices.

🔗 **Live Demo**: https://portfolio-tracker-two-ruby.vercel.app/  
🔗 **Repository**: https://github.com/Priyank404/Portfolio-Tracker

---

## 🚀 Features

- 🔐 User Authentication (Login / Signup)
- 📈 Track Buy & Sell Transactions
- 🧾 View Holdings and Portfolio Summary
- 📊 Interactive Charts for Portfolio Performance
- 📥 Export Data (CSV / JSON)
- 🔔 Notifications for user actions
- 📱 Fully Responsive UI
- 🧩 Clean separation of Frontend & Backend

---

## 🗂 Project Structure

```
Portfolio-Tracker/
│
├── frontend/        # React + Vite frontend
├── backend/         # Node.js + Express backend
├── README.md
└── package.json
```

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Recharts
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- REST APIs

### Tools & Deployment
- Git & GitHub
- Vercel (Frontend)
- MongoDB (Local / Atlas)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Priyank404/Portfolio-Tracker.git
cd Portfolio-Tracker
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside the **backend** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Backend runs on:
```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```

---

## 🔁 Application Flow

1. User signs up / logs in
2. User adds buy & sell transactions
3. Backend stores and processes data
4. Holdings and portfolio value are calculated
5. Charts visualize portfolio performance
6. User can export portfolio data

---

## 📌 Learning Highlights

- MERN stack project architecture
- Secure JWT authentication
- Production-style backend services
- Context API state management
- Frontend–Backend integration
- Data visualization with charts

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to branch
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Priyank Khambhati**  
GitHub: https://github.com/Priyank404

---

⭐ If you like this project, please **star the repository**!

