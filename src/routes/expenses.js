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

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { amount, description } = req.body;

  if (amount === undefined && description === undefined) {
    return res.status(400).json({
      error: "At least one field (amount or description) is required",
    });
  }

  db.get(
    "SELECT * FROM expenses WHERE id = ?",
    [id],
    async (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (!row) {
        return res.status(404).json({ error: "Expense not found" });
      }

      let category = row.category;

      if (description && description !== row.description) {
        try {
          category = await categorizeExpense(description);
        } catch {
          category = row.category;
        }
      }

      const updatedAmount = amount ?? row.amount;
      const updatedDescription = description ?? row.description;

      db.run(
        `
        UPDATE expenses
        SET amount = ?, description = ?, category = ?
        WHERE id = ?
        `,
        [updatedAmount, updatedDescription, category, id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: "Failed to update expense" });
          }

          res.json({
            id,
            amount: updatedAmount,
            description: updatedDescription,
            category,
          });
        }
      );
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM expenses WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to delete expense" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json({ message: "Expense deleted successfully" });
    }
  );
});


module.exports = router;
