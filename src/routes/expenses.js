const express = require("express");
const db = require("../db");
const { categorizeExpense } = require("../ai");

const router = express.Router();

router.post("/", (req, res) => {
  const { amount, description, idempotencyKey } = req.body;

  if (!amount || !idempotencyKey) {
    return res.status(400).json({
      error: "amount and idempotencyKey are required",
    });
  }

  db.get(
    "SELECT * FROM expenses WHERE id = ?",
    [idempotencyKey],
    async (err, row) => {
      if (err) {
        console.error("DB SELECT error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (row !== undefined) {
        console.log("IDEMPOTENT HIT — returning existing expense");
        return res.status(200).json({
          message: "Expense already created",
          expense: row,
        });
      }

      let category;
      try {
        category = await categorizeExpense(description);
      } catch (err) {
        console.error("AI error:", err.message);
        category = "Other";
      }

      db.run(
        "INSERT INTO expenses (id, amount, description, category) VALUES (?, ?, ?, ?)",
        [idempotencyKey, amount, description || "", category],
        function (err) {
          if (err) {
            console.error("DB INSERT error:", err);
            return res.status(500).json({ error: "Failed to create expense" });
          }

          return res.status(201).json({
            id: idempotencyKey,
            amount,
            description,
            category,
          });
        }
      );
    }
  );
});

router.get("/", (req, res) => {
  db.all(
    "SELECT * FROM expenses ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch expenses" });
      }

      res.json(rows);
    }
  );
});


module.exports = router;
