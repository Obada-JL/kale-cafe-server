const mongoose = require("mongoose");

const hookahImagesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
    required: true,
  },
  originalName: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("hookahImages", hookahImagesSchema); 