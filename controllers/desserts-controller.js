const Desserts = require("../models/desserts-model");

const getDesserts = async (req, res) => {
  try {
    const desserts = await Desserts.find().populate('category');
    res.json(desserts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addDesserts = async (req, res) => {
  const { name, category, price, description } = req.body;
  const newDessert = new Desserts({
    name: name,
    category: category,
    price: price,
    description: description,
  });
  try {
    await newDessert.save();
    const populatedDessert = await Desserts.findById(newDessert._id).populate('category');
    res.status(201).json({ data: { project: populatedDessert } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};

const deleteDessert = async (req, res) => {
  const { id } = req.params;
  try {
    await Desserts.findByIdAndDelete(id);
    res.status(200).json({ message: "Dessert deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

const updateDessert = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description } = req.body;

  const updateData = {
    name: name,
    category: category,
    price: price,
    description: description,
  };
  try {
    const updatedDessert = await Desserts.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('category');
    res.status(200).json({ data: { project: updatedDessert } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

module.exports = { getDesserts, addDesserts, updateDessert, deleteDessert };
