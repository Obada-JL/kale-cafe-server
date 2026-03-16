const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 0
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  }
});

module.exports = mongoose.model("Counter", counterSchema);
