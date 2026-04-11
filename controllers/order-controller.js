const Order = require("../models/order-model");
const Table = require("../models/table-model");
const printerController = require("./printer-controller");

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
  const { table, items, notes, createdBy, orderType, paymentMethod, discount, tableNumber } = req.body;
  try {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxValue = paymentMethod === 'credit_card' ? subtotal * 0.05 : 0;

    const newOrder = new Order({ 
      table: orderType !== 'delivery' ? table : null, 
      tableNumber: tableNumber || null,
      items, 
      notes, 
      createdBy,
      orderType,
      paymentMethod,
      subtotal,
      discount: Number(discount) || 0,
      tax: taxValue,
      totalAmount: subtotal - (Number(discount) || 0) - taxValue,
    });
    await newOrder.save();

    // Set table status to occupied only if it's a table order
    if (orderType !== 'delivery' && table) {
      await Table.findByIdAndUpdate(table, { status: 'occupied' });
    }

    const populatedOrder = orderType !== 'delivery' && table 
      ? await Order.findById(newOrder._id).populate('table')
      : await Order.findById(newOrder._id);
      
    // Automated bar print (failure-tolerant)
    // try {
    //   await printerController.handleBarPrint(populatedOrder, 'ar');
    // } catch (printError) {
    //   console.error("Automated bar print failed:", printError.message);
    // }

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { items, notes } = req.body;
  try {
    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }
    const finalItems = items || currentOrder.items;
    const finalPaymentMethod = req.body.paymentMethod || currentOrder.paymentMethod;
    const subtotal = finalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountValue = req.body.discount !== undefined ? Number(req.body.discount) : currentOrder.discount;
    const taxValue = finalPaymentMethod === 'credit_card' ? subtotal * 0.05 : 0;
    
    const updateData = {};
    if (items) updateData.items = items;
    if (notes !== undefined) updateData.notes = notes;
    if (req.body.paymentMethod) updateData.paymentMethod = req.body.paymentMethod;
    if (req.body.orderType) updateData.orderType = req.body.orderType;
    if (req.body.tableNumber) updateData.tableNumber = req.body.tableNumber;
    
    updateData.discount = discountValue;
    updateData.tax = taxValue;
    updateData.totalAmount = subtotal - discountValue - taxValue;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true }).populate('table');
    if (!updatedOrder) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    // Automated bar print (failure-tolerant)
    // try {
    //   await printerController.handleBarPrint(updatedOrder, 'ar', currentOrder.items);
    // } catch (printError) {
    //   console.error("Automated bar print failed (update):", printError.message);
    // }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, paymentMethod } = req.body;
  try {
    const updateData = { status };
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    
    const order = await Order.findByIdAndUpdate(id, updateData, { new: true }).populate('table');
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    // If order is completed or cancelled, check if table has other active orders
    if ((status === 'completed' || status === 'cancelled') && order.table) {
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

    // Dish filter
    if (req.query.dish) {
      filter['items.name'] = { $regex: req.query.dish, $options: 'i' };
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
