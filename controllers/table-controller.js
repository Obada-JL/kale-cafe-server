const Table = require("../models/table-model");

const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addTable = async (req, res) => {
  const { number, capacity, location } = req.body;
  try {
    const existing = await Table.findOne({ number });
    if (existing) {
      return res.status(400).json({ message: "رقم الطاولة موجود بالفعل" });
    }
    const newTable = new Table({ number, capacity, location });
    await newTable.save();
    res.status(201).json(newTable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTable = async (req, res) => {
  const { id } = req.params;
  const { number, capacity, status, location } = req.body;
  try {
    const updatedTable = await Table.findByIdAndUpdate(
      id,
      { number, capacity, status, location },
      { new: true }
    );
    if (!updatedTable) {
      return res.status(404).json({ message: "الطاولة غير موجودة" });
    }
    res.json(updatedTable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    await Table.findByIdAndDelete(id);
    res.json({ message: "تم حذف الطاولة بنجاح" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getTables, addTable, updateTable, deleteTable };
