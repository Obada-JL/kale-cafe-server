const Images = require("../models/images-model");

const getImages = async (req, res) => {
  const getimage = await Images.find();
  res.json(getimage);
};
const addImage = async (req, res) => {
  const { image, category, name } = req.body;
  const newImage = new Images({
    category: category,
    name: name,
    image: req.file.filename,
  });
  try {
    await newImage.save();
    res.status(201).json({ data: { image: newImage } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};
const deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    await Images.findByIdAndDelete(id);
    res.status(200).json({ message: "Image deleted successfuly" });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};
const updateImage = async (req, res) => {
  const { id } = req.params;
  const { name, category, image } = req.body;

  const updateData = {
    name,
    category,
    image,
  };
  try {
    const updatedImage = await Images.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(200).json({ data: { project: updatedImage } });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};
module.exports = { getImages, addImage, updateImage, deleteImage };
