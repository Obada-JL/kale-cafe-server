const Drinks = require("../models/drinks-model");

const getDrinks = async (req, res) => {
  const getdDrinks = await Drinks.find();
  res.json(getdDrinks);
};
const addDrinks = async (req, res) => {
  const { name, category, price } = req.body;
  const newDrink = new Drinks({
    name: name,
    category: category,
    price: price,
  });
  try {
    await newDrink.save();
    res.status(201).json({ data: { project: newDrink } });
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
  const { name, category, price } = req.body;

  const updateData = {
    name,
    category,
    price,
  };
  try {
    const updatedDrink = await Drinks.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(200).json({ data: { project: updatedDrink } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};
const SearchDrink = async (req, res) => {
  // const searchTerm = req.query.q;
  // const query = { $text: { $search: searchTerm } };
  // Return only the `title` of each matched document
  const projection = {
    _id: 0,
    title: 1,
  };
  // Find documents based on our query and projection
  // .project(projection)
  // const searchedDrink = Drinks.find(query);
  // const results = await searchedDrink.toArray();
  // try {
  //   res.json(results).status(200);
  // } catch (e) {
  //   console.log(e);
  // }
  const searchTerm = req.query.q;

  try {
    // Make sure there's a text index on the relevant fields
    const query = { $text: { $search: searchTerm } };
    const searchedDrink = await Drinks.find(query).toArray();

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
