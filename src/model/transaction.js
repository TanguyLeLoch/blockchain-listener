const mongoose = require("mongoose");

const transactionShema = new mongoose.Schema({
  blockHash: { type: String },
  blockNumber: { type: String },
  from: { type: String },
  gas: { type: Number },
  gasPrice: { type: String },
  hash: { type: String },
  input: { type: String },
  nonce: { type: Number },
  to: { type: String },
  transactionIndex: { type: String },
  value: { type: String },
  type: { type: Number },
  v: { type: String },
  r: { type: String },
  s: { type: String },
  parsedData: { type: Object },
  calculatedInfo: { type: Object },
});

module.exports = mongoose.model("Transaction", transactionShema);
