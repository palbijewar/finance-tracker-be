# Finance Tracker Backend

This is the backend service for the Finance Tracker application.  
It provides REST APIs to manage expenses with support for idempotent requests and AI-based categorization.

---

## 🚀 Features

- Create, read, update, and delete expenses (CRUD)
- Idempotent expense creation to safely handle retries
- SQLite persistence (file-based database)
- AI-assisted expense categorization with graceful fallback
- Clean REST API design

---

## 🧠 Design Highlights

### Idempotent Create API
Each expense creation request requires an `idempotencyKey`.  
If the same request is sent multiple times with the same key, the backend:
- Creates the expense only once
- Returns the existing record for subsequent retries

This prevents duplicate entries caused by network retries or client refreshes.

---

### AI Categorization (Best-Effort)
The backend attempts to categorize expenses into predefined categories:

- Food
- Travel
- Shopping
- Bills
- Entertainment
- Other

If the AI service is unavailable, rate-limited, or misconfigured:
- The backend falls back to a random category
- Core expense creation **never fails due to AI**

---

### Database Choice
SQLite is used for simplicity and reliability:
- Zero configuration
- File-based persistence
- Ideal for assignments and small services

Schema evolution (adding new columns) is handled safely on startup.

---

## 🛠 Tech Stack

- Node.js
- Express.js
- SQLite (`sqlite3`)
- OpenAI API (optional enhancement)

---

## 📦 Project Structure

