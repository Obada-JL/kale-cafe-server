const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['foods', 'drinks', 'desserts', 'hookahs'],
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index for name and type
categorySchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("categories", categorySchema); 