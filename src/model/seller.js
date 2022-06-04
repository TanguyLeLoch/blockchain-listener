const mongoose = require("mongoose");

const sellerShema = new mongoose.Schema({
  sellerAddress: { type: String, required: true },
  contractAddress: { type: String, required: true },
});

module.exports = mongoose.model("Seller", sellerShema);
