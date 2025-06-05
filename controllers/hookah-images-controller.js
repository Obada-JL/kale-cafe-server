const HookahImages = require("../models/hookah-images-model");

const getHookahImages = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const getimage = await HookahImages.find(query).populate('category');
    res.json(getimage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addHookahImage = async (req, res) => {
  const { name, category } = req.body;
  const newImage = new HookahImages({
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

const deleteHookahImage = async (req, res) => {
  const { id } = req.params;
  try {
    await HookahImages.findByIdAndDelete(id);
    res.status(200).json({ message: "Hookah image deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

module.exports = { getHookahImages, addHookahImage, deleteHookahImage }; 