const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      default: "UNKNOWN",
    },
    walletAddress: {
      type: String,
      default: "",
    },
    toAddress: {
      type: String,
      default: "",
    },
    amount: {
      type: String,
      default: "0",
    },
    txHash: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "PENDING",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);