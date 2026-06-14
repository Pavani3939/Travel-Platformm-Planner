# 🌍 Travel Planner Platform

A full-stack, responsive travel planning and budget-tracking application. This application uses a simulated in-memory Java collections database to implement robust User Registration, Authentication, day-by-day Itinerary Planning, Budget Category breakdowns, and Administrative Controls.

🚀 **[Live Demo](https://travel-platformm-planner.vercel.app/)**
*(Note: Because this is a demonstration, the Java backend is designed to run locally. To log in or fetch data, you must run the backend server on your own machine.)*

## 🌟 Key Features
- **Day-by-Day Itinerary Planning:** Interactive schedule editor and budget tracker.
- **Dual Role System:** Pre-configured Standard User and Administrator roles with distinct access privileges.
- **No External Database Required:** Uses an innovative, thread-safe in-memory Java Collections simulated database.
- **Modern Minimalist UI:** Elegant styling with a dark gradient system, glassmorphic cards, and Lucide-React icons.
- **Administrative Controls:** Platform monitoring and destination catalog management.

## 🛠️ Modern Tech Stack & Tooling
- **Frontend Core:** Built with React.js and styled with Custom Vanilla CSS for a premium dark mode experience.
- **Backend Architecture:** Java Servlets executing an MVC architecture with session-based authentication.
- **Build Tools:** Maven for the backend server runtime (with `jetty-maven-plugin`), and Vite for the lightning-fast frontend dev server.
- **Data Storage:** Java Collections acting as a thread-safe in-memory database simulator.

## 📂 Project Structure
```text
Travel Planner Platform/
├── backend/
│   ├── pom.xml                                   # Maven dependency file (Jetty Plugin)
│   └── src/main/
│       ├── java/com/travelplanner/               # Core backend services, servlets, and models
│       └── webapp/WEB-INF/
│           └── web.xml                           # Servlet and Filter mappings
├── frontend/
│   ├── package.json                              # React dependencies mapping
│   ├── vite.config.js                            # Vite configurations (Port: 5173)
│   ├── index.html                                # Main DOM root mapping
│   └── src/                                      # React components, pages, and API utilities
└── README.md                                     # System documentation
```

## 🚀 Setup & Launch Instructions

**Prerequisites:** Java JDK 17+, Apache Maven, Node.js (v18+).

### 1. Launch the Backend Server
Navigate to the `backend/` directory and run:
```bash
cd backend
mvn jetty:run
```
The server will run on `http://localhost:8080`.

### 2. Launch the Frontend React Client
Navigate to the `frontend/` directory, install dependencies, and run:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🔑 Demo Account Credentials

| Role | Username | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Standard User** | `user` | `user123` | Can plan trips, check budgets, edit schedules. Comes with a default Paris trip. |
| **Administrator** | `admin` | `admin123` | Access Admin Console to view global metrics, manage users, and add destinations. |
