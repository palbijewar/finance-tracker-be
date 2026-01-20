const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const expenseRoutes = require("./routes/expenses");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/expenses", expenseRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
