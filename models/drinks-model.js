const mongoose = require("mongoose");

const drinkSchema = new mongoose.Schema({
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
module.exports = mongoose.model("drinks", drinkSchema);
