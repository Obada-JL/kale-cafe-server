const Foods = require("../models/hookah-model");

const gethookahs = async (req, res) => {
  const hookahs = await Foods.find();
  res.json(hookahs);
};
const addhookahs = async (req, res) => {
  const { name, category, price } = req.body;
  const newhookah = new Foods({
    name: name,
    category: category,
    price: price,
  });
  try {
    await newhookah.save();
    res.status(201).json({ data: { project: newhookah } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};
const deletehookah = async (req, res) => {
  const { id } = req.params;
  try {
    await Foods.findByIdAndDelete(id);
    res.status(200).json({ message: "hookah deleted successfuly" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};
const updatehookah = async (req, res) => {
  const { id } = req.params;
  const { name, category, price } = req.body;

  const updateData = {
    name: name,
    category: category,
    price: price,
  };
  try {
    const updatedhookah = await Foods.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(200).json({ data: { project: updatedhookah } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};
module.exports = { gethookahs, addhookahs, updatehookah, deletehookah };
