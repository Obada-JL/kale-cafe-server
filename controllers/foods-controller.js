const Foods = require("../models/foods-model");

const getfoods = async (req, res) => {
  try {
    const foods = await Foods.find().populate('category');
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addfoods = async (req, res) => {
  const { name, category, price, description } = req.body;
  const newfood = new Foods({
    name: name,
    category: category,
    price: price,
    description: description,
  });
  try {
    await newfood.save();
    const populatedFood = await Foods.findById(newfood._id).populate('category');
    res.status(201).json({ data: { project: populatedFood } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};

const deletefood = async (req, res) => {
  const { id } = req.params;
  try {
    await Foods.findByIdAndDelete(id);
    res.status(200).json({ message: "food deleted successfuly" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

const updatefood = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description } = req.body;

  const updateData = {
    name: name,
    category: category,
    price: price,
    description: description,
  };
  try {
    const updatedfood = await Foods.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('category');
    res.status(200).json({ data: { project: updatedfood } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

module.exports = { getfoods, addfoods, updatefood, deletefood };
