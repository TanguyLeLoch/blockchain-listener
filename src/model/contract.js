const mongoose = require("mongoose");

const contractShema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  feeBuy: { type: Number, required: false },
  feesBuy: { type: Array, required: false },
  feeSell: { type: Number, required: false },
  feesSell: { type: Array, required: false },
  sellers: { type: Array, required: false },
  transactions: { type: Array, required: false },
});

module.exports = mongoose.model("Contract", contractShema);
