const Desserts = require("../models/desserts-model");

const getDesserts = async (req, res) => {
  const desserts = await Desserts.find();
  res.json(desserts);
};
const addDesserts = async (req, res) => {
  const { name, category, price } = req.body;
  const newDessert = new Desserts({
    name,
    category,
    price,
  });
  try {
    await newDessert.save();
    res.status(201).json({ data: { project: newDessert } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};
const deleteDessert = async (req, res) => {
  const { id } = req.params;
  try {
    await Desserts.findByIdAndDelete(id);
    res.status(200).json({ message: "Dessert deleted successfuly" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};
const updateDessert = async (req, res) => {
  const { id } = req.params;
  const { name, category, price } = req.body;

  const updateData = {
    name,
    category,
    price,
  };
  try {
    const updatedDessert = await Desserts.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(200).json({ data: { project: updatedDessert } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};
module.exports = { getDesserts, addDesserts, updateDessert, deleteDessert };
