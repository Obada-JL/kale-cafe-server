const mongoose = require("mongoose");

const dessertSchema = new mongoose.Schema({
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
module.exports = mongoose.model("desserts", dessertSchema);
