const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // idempotencyKey
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Other",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
