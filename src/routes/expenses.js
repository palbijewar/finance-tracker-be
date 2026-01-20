const express = require("express");
const Expense = require("../Models/Expenses");
const { categorizeExpense } = require("../ai");

const router = express.Router();

router.post("/", async (req, res) => {
  const { amount, description, idempotencyKey } = req.body;

  if (!amount || !idempotencyKey) {
    return res.status(400).json({
      error: "amount and idempotencyKey are required",
    });
  }

  const existing = await Expense.findById(idempotencyKey);
  if (existing) {
    return res.json({
      message: "Expense already created",
      expense: existing,
    });
  }

  let category = "Other";
  try {
    category = await categorizeExpense(description);
  } catch {}

  const expense = await Expense.create({
    _id: idempotencyKey,
    amount,
    description,
    category,
  });

  res.status(201).json(expense);
});

router.get("/", async (req, res) => {
  const expenses = await Expense.find().sort({ created_at: -1 });
  res.json(expenses);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, description } = req.body;

  const expense = await Expense.findById(id);
  if (!expense) {
    return res.status(404).json({ error: "Expense not found" });
  }

  if (amount !== undefined) expense.amount = amount;

  if (description && description !== expense.description) {
    expense.description = description;
    try {
      expense.category = await categorizeExpense(description);
    } catch {}
  }

  await expense.save();
  res.json(expense);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await Expense.findByIdAndDelete(id);
  if (!result) {
    return res.status(404).json({ error: "Expense not found" });
  }

  res.json({ message: "Expense deleted successfully" });
});

module.exports = router;
