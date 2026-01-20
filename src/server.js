const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const db = require("./db");
const expenseRoutes = require("./routes/expenses");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/expenses", expenseRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

