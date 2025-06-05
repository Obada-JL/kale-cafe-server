const Category = require("../models/categories-model");

const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) {
      filter.type = type;
    }
    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFoodCategories = async (req, res) => {
  try {
    const categories = await Category.find({ type: 'foods' }).sort({ order: 1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDrinkCategories = async (req, res) => {
  try {
    const categories = await Category.find({ type: 'drinks' }).sort({ order: 1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDessertCategories = async (req, res) => {
  try {
    const categories = await Category.find({ type: 'desserts' }).sort({ order: 1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHookahCategories = async (req, res) => {
  try {
    const categories = await Category.find({ type: 'hookahs' }).sort({ order: 1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const seedCategories = async (req, res) => {
  try {
    const categoriesData = [
      // Foods categories
      { name: "المقبلات", type: "foods", order: 1 },
      { name: "المأكولات الغربية", type: "foods", order: 2 },
      { name: "المشاوي", type: "foods", order: 3 },
      { name: "الوجبات الخفيفة", type: "foods", order: 4 },
      { name: "المأكولات الشرقية", type: "foods", order: 5 },
      
      // Drinks categories
      { name: "الكوكتيلات", type: "drinks", order: 1 },
      { name: "العصير الفريش", type: "drinks", order: 2 },
      { name: "الفواكه", type: "drinks", order: 3 },
      { name: "الميلك شيك", type: "drinks", order: 4 },
      { name: "المشروبات الباردة", type: "drinks", order: 5 },
      { name: "المشروبات الساخنة", type: "drinks", order: 6 },
      { name: "مشروبات الفروزن", type: "drinks", order: 7 },
      { name: "مشروب الموهيتو البارد", type: "drinks", order: 8 },
      { name: "المشروبات الغازية", type: "drinks", order: 9 },
      { name: "عصائر الديتوكس الباردة", type: "drinks", order: 10 },
      { name: "أصناف مميزة", type: "drinks", order: 11 },
      
      // Desserts categories
      { name: "الحلويات", type: "desserts", order: 1 },
      { name: "حلويات فرنسية", type: "desserts", order: 2 },
      { name: "البوظة", type: "desserts", order: 3 },
      
      // Hookah categories
      { name: "الأراكيل", type: "hookahs", order: 1 },
    ];

    // Clear existing categories
    await Category.deleteMany({});
    
    // Insert new categories
    const insertedCategories = await Category.insertMany(categoriesData);
    
    res.status(201).json({
      message: "Categories seeded successfully",
      count: insertedCategories.length,
      categories: insertedCategories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getFoodCategories,
  getDrinkCategories,
  getDessertCategories,
  getHookahCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
}; 