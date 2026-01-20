# Finance Tracker Backend

This is the backend service for the Finance Tracker application.
It provides REST APIs to manage expenses with support for idempotent requests and AI-based categorization.

---

## 🚀 Features

* Create, read, update, and delete expenses (CRUD)
* Idempotent expense creation to safely handle retries
* MongoDB persistence using Mongoose ODM
* AI-assisted expense categorization with graceful fallback
* Clean, RESTful API design
* Deployment-ready for cloud platforms (Render)

---

## 🧠 Design Highlights

### Idempotent Create API

Each expense creation request requires an `idempotencyKey`.
This key is used as the **document `_id` in MongoDB**, ensuring idempotency at the database level.

If the same request is sent multiple times with the same key, the backend:

* Creates the expense only once
* Returns the existing record for subsequent retries

This prevents duplicate entries caused by network retries or client refreshes.

---

### AI Categorization (Best-Effort)

The backend attempts to categorize expenses into predefined categories:

* Food
* Travel
* Shopping
* Bills
* Entertainment
* Other

If the AI service is unavailable, rate-limited, or misconfigured:

* The backend falls back to a default category (`Other`)
* Core expense creation **never fails due to AI**

AI is treated as an enhancement, not a dependency.

---

### Database Choice

MongoDB is used for persistence with Mongoose as the ODM:

* Cloud-native and deployment-friendly
* No filesystem or native binary dependencies
* Schema validation via Mongoose models
* Easy scalability for future features

Using MongoDB avoids issues related to file-based databases in server environments.

---

## 🛠 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* OpenAI API (optional enhancement)

---

## 📦 Project Structure

```
backend/
├── src/
│   ├── server.js            # App entry point
│   ├── db.js                # MongoDB connection
│   ├── ai.js                # AI categorization logic
│   ├── models/
│   │   └── Expense.js       # Mongoose schema
│   └── routes/
│       └── expenses.js      # Expense APIs
├── .env                     # Environment variables
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance-tracker
OPENAI_API_KEY=your_openai_api_key
```

> `OPENAI_API_KEY` is optional.
> If not provided or if quota is exceeded, the backend continues to work with fallback logic.

---

## ▶️ Running the Backend Locally

```bash
cd backend
npm install
npm run dev
```

Server will start on:

```
http://localhost:3000
```

Health check:

```
GET /health
```

---

## 📌 API Endpoints

### Create Expense (Idempotent)

```http
POST /expenses
```

```json
{
  "amount": 120,
  "description": "Lunch",
  "idempotencyKey": "unique-key-123"
}
```

---

### Get All Expenses

```http
GET /expenses
```

---

### Update Expense

```http
PUT /expenses/:id
```

```json
{
  "amount": 150,
  "description": "Lunch with friends"
}
```

---

### Delete Expense

```http
DELETE /expenses/:id
```

---

## 🧪 Error Handling

* Invalid input → `400 Bad Request`
* Resource not found → `404 Not Found`
* Database or server errors → `500 Internal Server Error`
* AI failures → handled internally with safe fallbacks

---

## ✅ Notes

* Idempotency is enforced at the database level using MongoDB `_id`
* AI integration is optional and non-blocking
* Designed for clarity, correctness, and easy extensibility

---

## 👨‍💻 Author

Built as part of a full-stack expense tracking assignment with emphasis on:

* clean backend architecture
* safe and idempotent APIs
* real-world deployment considerations

---

### 📌 Suggested Commit Message

