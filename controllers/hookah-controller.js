const Hookah = require("../models/hookah-model");

const getHookah = async (req, res) => {
  try {
    const hookah = await Hookah.find().populate('category');
    res.json(hookah);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addHookah = async (req, res) => {
  const { name, category, price, description } = req.body;
  const newHookah = new Hookah({
    name: name,
    category: category,
    price: price,
    description: description,
  });
  try {
    await newHookah.save();
    const populatedHookah = await Hookah.findById(newHookah._id).populate('category');
    res.status(201).json({ data: { project: populatedHookah } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};

const deleteHookah = async (req, res) => {
  const { id } = req.params;
  try {
    await Hookah.findByIdAndDelete(id);
    res.status(200).json({ message: "Hookah deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

const updateHookah = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description } = req.body;

  const updateData = {
    name: name,
    category: category,
    price: price,
    description: description,
  };
  try {
    const updatedHookah = await Hookah.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('category');
    res.status(200).json({ data: { project: updatedHookah } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

module.exports = { getHookah, addHookah, updateHookah, deleteHookah };
