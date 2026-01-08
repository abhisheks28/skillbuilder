# SkillBuilder

SkillBuilder is a comprehensive educational platform designed to manage and track student progress through quizzes, puzzles, and reports. It features a modern, responsive frontend built with React and a robust backend powered by FastAPI and PostgreSQL.

## 🚀 Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS, Shadcn UI (Radix Primitives)
- **Routing:** React Router DOM v7
- **State/Animations:** Framer Motion
- **Data Visualization:** Recharts
- **Utilities:** PDF Generation (jsPDF), Excel Export (xlsx)

### Backend
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **Database:** PostgreSQL (AsyncPG)
- **Authentication/Integrations:** Firebase Admin

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/) (v3.8 or higher)
- [PostgreSQL](https://www.postgresql.org/)

## 🛠️ Installation & Setup

### 1. Database Setup
1. Ensure PostgreSQL is running.
2. Create a database named `skillbuilder` (or as configured in your `.env`).

### 2. Backend Setup (`server_python`)

1. Navigate to the backend directory:
   ```bash
   cd server_python
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   - Copy `env.example` to a new file named `.env`:
     ```bash
     cp env.example .env
     ```
   - Open `.env` and update the database credentials and Firebase configuration.

5. Initialize the Database:
   ```bash
   python init_db.py
   # or
   python setup_db.py
   ```

6. Start the Backend Server:
   ```bash
   python run.py
   ```
   The backend will be available at `http://localhost:8000` (or the port specified in `run.py`).

### 3. Frontend Setup (`client`)

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Development Server:
   ```bash
   npm run dev
   ```
   The application will be accessible at the URL shown in the terminal (typically `http://localhost:5173`).

## 🧪 Testing

There are two main ways to test the backend API:

### 1. Manual Testing via Swagger UI
FastAPI automatically generates interactive API documentation.
1. Ensure the backend server is running (`python run.py`).
2. Open your browser to `http://localhost:8000/docs`.
3. Click on an endpoint (e.g., `POST /api/auth/register`).
4. Click **Try it out**.
5. Enter the JSON payload. Example for a student:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "securepassword",
     "role": "student",
     "grade": "5",
     "phone": "555-0100"
   }
   ```
6. Click **Execute**.

### 2. Automated Testing with Pytest
We use `pytest` and `httpx` for automated testing.
1. Navigate to the `server_python` directory.
2. Run the tests:
   ```bash
   pytest
   ```
   Or to run the specific API tests:
   ```bash
   pytest tests/test_api.py
   ```

## 📂 Project Structure

```
d:\learners\fastapi\
├── client\                  # Frontend React application
│   ├── src\                 # Source code (components, pages, utils)
│   ├── public\              # Static assets
│   ├── main.tsx            # Entry point
│   └── ...
├── server_python\           # Backend FastAPI application
│   ├── app\                 # API routes and models
│   ├── tests\               # Automated tests
│   ├── requirements.txt     # Python dependencies
│   ├── run.py              # Server entry point
│   └── ...
└── README.md
```

## 🌟 Key Features

- **Interactive Dashboards:** Tailored views for Admins, Teachers, and Students.
- **Quiz & Puzzle Engine:** engaging learning modules.
- **Reporting:** Detailed PDF reports and Excel exports of student performance.
- **User Management:** Role-based access control.
