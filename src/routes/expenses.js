const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

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
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (row) {
        return res.json({
          message: "Expense already created",
          expense: row,
        });
      }

      const id = idempotencyKey;

      db.run(
        "INSERT INTO expenses (id, amount, description) VALUES (?, ?, ?)",
        [id, amount, description || ""],
        function (err) {
          if (err) {
            return res.status(500).json({ error: "Failed to create expense" });
          }

          res.status(201).json({
            id,
            amount,
            description,
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
