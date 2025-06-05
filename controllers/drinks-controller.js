const Drinks = require("../models/drinks-model");

const getDrinks = async (req, res) => {
  try {
    const getdDrinks = await Drinks.find().populate('category');
    res.json(getdDrinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addDrinks = async (req, res) => {
  const { name, category, price, description } = req.body;
  const newDrink = new Drinks({
    name: name,
    category: category,
    price: price,
    description: description,
  });
  try {
    await newDrink.save();
    const populatedDrink = await Drinks.findById(newDrink._id).populate('category');
    res.status(201).json({ data: { project: populatedDrink } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};

const deleteDrink = async (req, res) => {
  const { id } = req.params;
  try {
    await Drinks.findByIdAndDelete(id);
    res.status(200).json({ message: "Drink deleted successfuly" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

const updateDrink = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description } = req.body;

  const updateData = {
    name,
    category,
    price,
    description,
  };
  try {
    const updatedDrink = await Drinks.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('category');
    res.status(200).json({ data: { project: updatedDrink } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

const SearchDrink = async (req, res) => {
  const searchTerm = req.query.q;

  try {
    const query = { $text: { $search: searchTerm } };
    const searchedDrink = await Drinks.find(query).populate('category');
    res.status(200).json(searchedDrink);
  } catch (error) {
    console.error("Error searching drinks:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getDrinks,
  addDrinks,
  updateDrink,
  deleteDrink,
  SearchDrink,
};
