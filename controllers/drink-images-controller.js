const DrinkImages = require("../models/drink-images-model");

const getDrinkImages = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const getimage = await DrinkImages.find(query).populate('category');
    res.json(getimage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addDrinkImage = async (req, res) => {
  const { name, category } = req.body;
  const newImage = new DrinkImages({
    name: name,
    category: category,
    imagePath: req.file.filename,
    originalName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
  });
  try {
    await newImage.save();
    res.status(201).json({ data: { image: newImage } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};

const deleteDrinkImage = async (req, res) => {
  const { id } = req.params;
  try {
    await DrinkImages.findByIdAndDelete(id);
    res.status(200).json({ message: "Drink image deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

module.exports = { getDrinkImages, addDrinkImage, deleteDrinkImage }; 