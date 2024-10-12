const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  price: {
    type: String,
  },
  category: {
    type: String,
  },
});
module.exports = mongoose.model("foods", foodSchema);
