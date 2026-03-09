const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    default: 4,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available',
  },
  location: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("tables", tableSchema);
