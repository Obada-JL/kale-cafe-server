const mongoose = require("mongoose");

const specialImagesSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
  },
  name: {
    type: String,
  },
});
module.exports = mongoose.model("images", specialImagesSchema);
