const Order = require("../models/order-model");
const Table = require("../models/table-model");

const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const orders = await Order.find(filter).populate('table').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrdersByTable = async (req, res) => {
  const { tableId } = req.params;
  try {
    const orders = await Order.find({ table: tableId }).populate('table').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addOrder = async (req, res) => {
  const { table, items, notes, createdBy } = req.body;
  try {
    const newOrder = new Order({ table, items, notes, createdBy });
    await newOrder.save();

    // Set table status to occupied
    await Table.findByIdAndUpdate(table, { status: 'occupied' });

    const populatedOrder = await Order.findById(newOrder._id).populate('table');
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { items, notes } = req.body;
  try {
    // Recalculate total
    const totalAmount = items ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : undefined;
    const updateData = {};
    if (items) { updateData.items = items; updateData.totalAmount = totalAmount; }
    if (notes !== undefined) updateData.notes = notes;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true }).populate('table');
    if (!updatedOrder) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true }).populate('table');
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    // If order is completed or cancelled, check if table has other active orders
    if (status === 'completed' || status === 'cancelled') {
      const activeOrders = await Order.find({ table: order.table._id, status: 'active' });
      if (activeOrders.length === 0) {
        await Table.findByIdAndUpdate(order.table._id, { status: 'available' });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (order && order.status === 'active') {
      // Check if table has other active orders
      const activeOrders = await Order.find({ table: order.table, status: 'active', _id: { $ne: id } });
      if (activeOrders.length === 0) {
        await Table.findByIdAndUpdate(order.table, { status: 'available' });
      }
    }
    await Order.findByIdAndDelete(id);
    res.json({ message: "تم حذف الطلب بنجاح" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getOrderLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // Status filter
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    // Date range filter
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) {
        filter.createdAt.$gte = new Date(req.query.from);
      }
      if (req.query.to) {
        const toDate = new Date(req.query.to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).populate('table').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getOrders, getOrdersByTable, addOrder, updateOrder, updateOrderStatus, deleteOrder, getOrderLogs };
