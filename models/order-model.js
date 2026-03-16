const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nameTr: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema({
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tables',
    required: false, // Changed to false to support delivery/takeaway
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  orderType: {
    type: String,
    enum: ['table', 'delivery'],
    default: 'table',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'pending'],
    default: 'pending',
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Auto-calculate totalAmount before saving
orderSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

module.exports = mongoose.model("orders", orderSchema);
