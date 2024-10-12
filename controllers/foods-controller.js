const Foods = require("../models/foods-model");

const getfoods = async (req, res) => {
  const foods = await Foods.find();
  res.json(foods);
};
const addfoods = async (req, res) => {
  const { name, category, price } = req.body;
  const newfood = new Foods({
    name: name,
    category: category,
    price: price,
  });
  try {
    await newfood.save();
    res.status(201).json({ data: { project: newfood } });
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
  const { name, category, price } = req.body;

  const updateData = {
    name: name,
    category: category,
    price: price,
  };
  try {
    const updatedfood = await Foods.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(200).json({ data: { project: updatedfood } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};
module.exports = { getfoods, addfoods, updatefood, deletefood };
