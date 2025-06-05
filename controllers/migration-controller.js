const Images = require("../models/images-model");
const Categories = require("../models/categories-model");
const DessertImages = require("../models/dessert-images-model");
const DrinkImages = require("../models/drink-images-model");
const FoodImages = require("../models/food-images-model");
const HookahImages = require("../models/hookah-images-model");
const Foods = require("../models/foods-model");
const Drinks = require("../models/drinks-model");
const Desserts = require("../models/desserts-model");
const Hookahs = require("../models/hookah-model");

// Migration function to update all products and images to use categoryId
const migrateToCategory = async (req, res) => {
  try {
    // Get all categories and create name-to-id mapping
    const categories = await Categories.find();
    const categoryMap = {};
    
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    let results = {
      foods: { updated: 0, errors: [] },
      drinks: { updated: 0, errors: [] },
      desserts: { updated: 0, errors: [] },
      hookahs: { updated: 0, errors: [] },
      foodImages: { updated: 0, errors: [] },
      drinkImages: { updated: 0, errors: [] },
      dessertImages: { updated: 0, errors: [] },
      hookahImages: { updated: 0, errors: [] }
    };

    // Update Foods
    const foods = await Foods.find();
    for (const food of foods) {
      try {
        if (typeof food.category === 'string' && categoryMap[food.category]) {
          await Foods.findByIdAndUpdate(food._id, { 
            category: categoryMap[food.category] 
          });
          results.foods.updated++;
        } else if (typeof food.category === 'string') {
          results.foods.errors.push(`Category not found: ${food.category} for food: ${food.name}`);
        }
      } catch (error) {
        results.foods.errors.push(`Error updating food ${food.name}: ${error.message}`);
      }
    }

    // Update Drinks
    const drinks = await Drinks.find();
    for (const drink of drinks) {
      try {
        if (typeof drink.category === 'string' && categoryMap[drink.category]) {
          await Drinks.findByIdAndUpdate(drink._id, { 
            category: categoryMap[drink.category] 
          });
          results.drinks.updated++;
        } else if (typeof drink.category === 'string') {
          results.drinks.errors.push(`Category not found: ${drink.category} for drink: ${drink.name}`);
        }
      } catch (error) {
        results.drinks.errors.push(`Error updating drink ${drink.name}: ${error.message}`);
      }
    }

    // Update Desserts
    const desserts = await Desserts.find();
    for (const dessert of desserts) {
      try {
        if (typeof dessert.category === 'string' && categoryMap[dessert.category]) {
          await Desserts.findByIdAndUpdate(dessert._id, { 
            category: categoryMap[dessert.category] 
          });
          results.desserts.updated++;
        } else if (typeof dessert.category === 'string') {
          results.desserts.errors.push(`Category not found: ${dessert.category} for dessert: ${dessert.name}`);
        }
      } catch (error) {
        results.desserts.errors.push(`Error updating dessert ${dessert.name}: ${error.message}`);
      }
    }

    // Update Hookahs
    const hookahs = await Hookahs.find();
    for (const hookah of hookahs) {
      try {
        if (typeof hookah.category === 'string' && categoryMap[hookah.category]) {
          await Hookahs.findByIdAndUpdate(hookah._id, { 
            category: categoryMap[hookah.category] 
          });
          results.hookahs.updated++;
        } else if (typeof hookah.category === 'string') {
          results.hookahs.errors.push(`Category not found: ${hookah.category} for hookah: ${hookah.name}`);
        }
      } catch (error) {
        results.hookahs.errors.push(`Error updating hookah ${hookah.name}: ${error.message}`);
      }
    }

    // Update Food Images
    const foodImages = await FoodImages.find();
    for (const image of foodImages) {
      try {
        if (typeof image.category === 'string' && categoryMap[image.category]) {
          await FoodImages.findByIdAndUpdate(image._id, { 
            category: categoryMap[image.category] 
          });
          results.foodImages.updated++;
        } else if (typeof image.category === 'string') {
          results.foodImages.errors.push(`Category not found: ${image.category} for food image: ${image.name}`);
        }
      } catch (error) {
        results.foodImages.errors.push(`Error updating food image ${image.name}: ${error.message}`);
      }
    }

    // Update Drink Images
    const drinkImages = await DrinkImages.find();
    for (const image of drinkImages) {
      try {
        if (typeof image.category === 'string' && categoryMap[image.category]) {
          await DrinkImages.findByIdAndUpdate(image._id, { 
            category: categoryMap[image.category] 
          });
          results.drinkImages.updated++;
        } else if (typeof image.category === 'string') {
          results.drinkImages.errors.push(`Category not found: ${image.category} for drink image: ${image.name}`);
        }
      } catch (error) {
        results.drinkImages.errors.push(`Error updating drink image ${image.name}: ${error.message}`);
      }
    }

    // Update Dessert Images
    const dessertImages = await DessertImages.find();
    for (const image of dessertImages) {
      try {
        if (typeof image.category === 'string' && categoryMap[image.category]) {
          await DessertImages.findByIdAndUpdate(image._id, { 
            category: categoryMap[image.category] 
          });
          results.dessertImages.updated++;
        } else if (typeof image.category === 'string') {
          results.dessertImages.errors.push(`Category not found: ${image.category} for dessert image: ${image.name}`);
        }
      } catch (error) {
        results.dessertImages.errors.push(`Error updating dessert image ${image.name}: ${error.message}`);
      }
    }

    // Update Hookah Images
    const hookahImages = await HookahImages.find();
    for (const image of hookahImages) {
      try {
        if (typeof image.category === 'string' && categoryMap[image.category]) {
          await HookahImages.findByIdAndUpdate(image._id, { 
            category: categoryMap[image.category] 
          });
          results.hookahImages.updated++;
        } else if (typeof image.category === 'string') {
          results.hookahImages.errors.push(`Category not found: ${image.category} for hookah image: ${image.name}`);
        }
      } catch (error) {
        results.hookahImages.errors.push(`Error updating hookah image ${image.name}: ${error.message}`);
      }
    }

    // Calculate totals
    const totalUpdated = Object.values(results).reduce((sum, result) => sum + result.updated, 0);
    const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors.length, 0);

    res.status(200).json({
      message: "Migration completed",
      totalUpdated: totalUpdated,
      totalErrors: totalErrors,
      availableCategories: Object.keys(categoryMap),
      details: results
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const migrateImages = async (req, res) => {
  try {
    // First, get all categories and create a mapping
    const categories = await Categories.find();
    const categoryMap = {};
    
    categories.forEach(cat => {
      categoryMap[cat.name] = {
        id: cat._id,
        type: cat.type
      };
    });

    const allImages = await Images.find();
    let migrated = 0;
    let errors = [];
    
    for (const image of allImages) {
      try {
        // Find matching category by name
        const categoryInfo = categoryMap[image.category];
        
        if (!categoryInfo) {
          errors.push(`Category not found: ${image.category} for image: ${image.name}`);
          continue;
        }

        const imageData = {
          name: image.name,
          imagePath: image.image, // Changed from 'image' to 'imagePath'
          category: categoryInfo.id, // Use ObjectId reference
          originalName: image.name,
          isActive: true,
        };

        // Check if image already exists in new collections based on imagePath
        let exists = false;
        let targetModel = null;

        // Determine target model based on category type
        switch (categoryInfo.type) {
          case 'desserts':
            exists = await DessertImages.findOne({ imagePath: image.image });
            targetModel = DessertImages;
            break;
          case 'drinks':
            exists = await DrinkImages.findOne({ imagePath: image.image });
            targetModel = DrinkImages;
            break;
          case 'foods':
            exists = await FoodImages.findOne({ imagePath: image.image });
            targetModel = FoodImages;
            break;
          case 'hookahs':
            exists = await HookahImages.findOne({ imagePath: image.image });
            targetModel = HookahImages;
            break;
          default:
            errors.push(`Unknown category type: ${categoryInfo.type} for image: ${image.name}`);
            continue;
        }

        if (!exists && targetModel) {
          await new targetModel(imageData).save();
          migrated++;
        }

      } catch (imageError) {
        errors.push(`Error processing image ${image.name}: ${imageError.message}`);
      }
    }

    res.status(200).json({ 
      message: "Images migrated successfully", 
      total: allImages.length,
      migrated: migrated,
      skipped: allImages.length - migrated,
      errors: errors,
      availableCategories: Object.keys(categoryMap)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New function to seed default categories if needed
const seedCategories = async (req, res) => {
  try {
    const defaultCategories = [
      // Food categories
      { name: "المقبلات", type: "foods", description: "مقبلات متنوعة", order: 1 },
      { name: "المأكولات الغربية", type: "foods", description: "أطباق غربية", order: 2 },
      { name: "المشاوي", type: "foods", description: "مشاوي مختلفة", order: 3 },
      { name: "الوجبات الخفيفة", type: "foods", description: "وجبات خفيفة", order: 4 },
      { name: "المأكولات الشرقية", type: "foods", description: "أطباق شرقية", order: 5 },
      
      // Drink categories
      { name: "الكوكتيلات", type: "drinks", description: "كوكتيلات متنوعة", order: 1 },
      { name: "العصير الفريش", type: "drinks", description: "عصائر طازجة", order: 2 },
      { name: "الفواكه", type: "drinks", description: "مشروبات الفواكه", order: 3 },
      { name: "الميلك شيك", type: "drinks", description: "ميلك شيك", order: 4 },
      { name: "المشروبات الباردة", type: "drinks", description: "مشروبات باردة", order: 5 },
      { name: "المشروبات الساخنة", type: "drinks", description: "مشروبات ساخنة", order: 6 },
      { name: "مشروبات الفروزن", type: "drinks", description: "مشروبات فروزن", order: 7 },
      { name: "مشروب الموهيتو البارد", type: "drinks", description: "موهيتو بارد", order: 8 },
      { name: "المشروبات الغازية", type: "drinks", description: "مشروبات غازية", order: 9 },
      { name: "عصائر الديتوكس الباردة", type: "drinks", description: "عصائر ديتوكس", order: 10 },
      { name: "أصناف مميزة", type: "drinks", description: "مشروبات مميزة", order: 11 },
      
      // Dessert categories
      { name: "الحلويات", type: "desserts", description: "حلويات عربية", order: 1 },
      { name: "حلويات فرنسية", type: "desserts", description: "حلويات فرنسية", order: 2 },
      { name: "البوظة", type: "desserts", description: "أنواع البوظة", order: 3 },
      
      // Hookah categories
      { name: "الأراكيل", type: "hookahs", description: "أنواع الأراكيل", order: 1 },
    ];

    let created = 0;
    let existing = 0;

    for (const categoryData of defaultCategories) {
      const existingCategory = await Categories.findOne({ 
        name: categoryData.name, 
        type: categoryData.type 
      });
      
      if (!existingCategory) {
        await new Categories(categoryData).save();
        created++;
      } else {
        existing++;
      }
    }

    res.status(200).json({
      message: "Categories seeded successfully",
      created: created,
      existing: existing,
      total: defaultCategories.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Migration function to assign default categories to products without categories
const assignDefaultCategories = async (req, res) => {
  try {
    const categories = await Categories.find();
    const categoryMap = {};
    
    categories.forEach(cat => {
      categoryMap[cat.type] = cat._id;
    });

    let results = {
      foods: { updated: 0, errors: [] },
      drinks: { updated: 0, errors: [] },
      desserts: { updated: 0, errors: [] },
      hookahs: { updated: 0, errors: [] }
    };

    // Get default categories by type
    const defaultFoodCategory = await Categories.findOne({ type: 'foods', name: 'الوجبات الخفيفة' });
    const defaultDrinkCategory = await Categories.findOne({ type: 'drinks', name: 'المشروبات الباردة' });
    const defaultDessertCategory = await Categories.findOne({ type: 'desserts', name: 'الحلويات' });
    const defaultHookahCategory = await Categories.findOne({ type: 'hookahs', name: 'الأراكيل' });

    // Update Foods without categories
    const foods = await Foods.find({ $or: [{ category: { $exists: false } }, { category: null }] });
    for (const food of foods) {
      try {
        if (defaultFoodCategory) {
          await Foods.findByIdAndUpdate(food._id, { 
            category: defaultFoodCategory._id 
          });
          results.foods.updated++;
        }
      } catch (error) {
        results.foods.errors.push(`Error updating food ${food.name}: ${error.message}`);
      }
    }

    // Update Drinks without categories
    const drinks = await Drinks.find({ $or: [{ category: { $exists: false } }, { category: null }] });
    for (const drink of drinks) {
      try {
        if (defaultDrinkCategory) {
          await Drinks.findByIdAndUpdate(drink._id, { 
            category: defaultDrinkCategory._id 
          });
          results.drinks.updated++;
        }
      } catch (error) {
        results.drinks.errors.push(`Error updating drink ${drink.name}: ${error.message}`);
      }
    }

    // Update Desserts without categories
    const desserts = await Desserts.find({ $or: [{ category: { $exists: false } }, { category: null }] });
    for (const dessert of desserts) {
      try {
        if (defaultDessertCategory) {
          await Desserts.findByIdAndUpdate(dessert._id, { 
            category: defaultDessertCategory._id 
          });
          results.desserts.updated++;
        }
      } catch (error) {
        results.desserts.errors.push(`Error updating dessert ${dessert.name}: ${error.message}`);
      }
    }

    // Update Hookahs without categories
    const hookahs = await Hookahs.find({ $or: [{ category: { $exists: false } }, { category: null }] });
    for (const hookah of hookahs) {
      try {
        if (defaultHookahCategory) {
          await Hookahs.findByIdAndUpdate(hookah._id, { 
            category: defaultHookahCategory._id 
          });
          results.hookahs.updated++;
        }
      } catch (error) {
        results.hookahs.errors.push(`Error updating hookah ${hookah.name}: ${error.message}`);
      }
    }

    const totalUpdated = Object.values(results).reduce((sum, result) => sum + result.updated, 0);
    const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors.length, 0);

    res.status(200).json({
      message: "Default categories assigned successfully",
      totalUpdated: totalUpdated,
      totalErrors: totalErrors,
      defaultCategories: {
        foods: defaultFoodCategory?.name,
        drinks: defaultDrinkCategory?.name,
        desserts: defaultDessertCategory?.name,
        hookahs: defaultHookahCategory?.name
      },
      details: results
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enhanced migration function to handle all cases
const migrateProductCategories = async (req, res) => {
  try {
    // Get all categories and create name-to-id mapping
    const categories = await Categories.find();
    const categoryMap = {};
    
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Find default categories for each type
    const defaultFoodCategory = categories.find(cat => cat.type === 'foods');
    const defaultDrinkCategory = categories.find(cat => cat.type === 'drinks');
    const defaultDessertCategory = categories.find(cat => cat.type === 'desserts');
    const defaultHookahCategory = categories.find(cat => cat.type === 'hookahs');

    let results = {
      foods: { updated: 0, errors: [] },
      drinks: { updated: 0, errors: [] },
      desserts: { updated: 0, errors: [] },
      hookahs: { updated: 0, errors: [] }
    };

    // Update Foods
    const foods = await Foods.find();
    console.log(`Processing ${foods.length} foods...`);
    for (const food of foods) {
      try {
        if (typeof food.category === 'string' && categoryMap[food.category]) {
          // Match string category with ObjectId
          await Foods.findByIdAndUpdate(food._id, { 
            category: categoryMap[food.category] 
          });
          results.foods.updated++;
          console.log(`Updated food ${food.name} with category ${food.category}`);
        } else if (typeof food.category === 'string') {
          results.foods.errors.push(`Category not found: ${food.category} for food: ${food.name}`);
        } else if (!food.category || food.category === null) {
          // Assign default category if no category or null
          if (defaultFoodCategory) {
            await Foods.findByIdAndUpdate(food._id, { 
              category: defaultFoodCategory._id 
            });
            results.foods.updated++;
            console.log(`Assigned default category to food ${food.name}`);
          }
        }
      } catch (error) {
        results.foods.errors.push(`Error updating food ${food.name}: ${error.message}`);
        console.error(`Error updating food ${food.name}:`, error);
      }
    }

    // Update Drinks
    const drinks = await Drinks.find();
    console.log(`Processing ${drinks.length} drinks...`);
    for (const drink of drinks) {
      try {
        if (typeof drink.category === 'string' && categoryMap[drink.category]) {
          // Match string category with ObjectId
          await Drinks.findByIdAndUpdate(drink._id, { 
            category: categoryMap[drink.category] 
          });
          results.drinks.updated++;
          console.log(`Updated drink ${drink.name} with category ${drink.category}`);
        } else if (typeof drink.category === 'string') {
          results.drinks.errors.push(`Category not found: ${drink.category} for drink: ${drink.name}`);
          console.log(`Category not found: ${drink.category} for drink: ${drink.name}`);
        } else if (!drink.category || drink.category === null) {
          // Assign default category if no category or null
          if (defaultDrinkCategory) {
            await Drinks.findByIdAndUpdate(drink._id, { 
              category: defaultDrinkCategory._id 
            });
            results.drinks.updated++;
            console.log(`Assigned default category to drink ${drink.name}`);
          }
        }
      } catch (error) {
        results.drinks.errors.push(`Error updating drink ${drink.name}: ${error.message}`);
        console.error(`Error updating drink ${drink.name}:`, error);
      }
    }

    // Update Desserts
    const desserts = await Desserts.find();
    console.log(`Processing ${desserts.length} desserts...`);
    for (const dessert of desserts) {
      try {
        if (typeof dessert.category === 'string' && categoryMap[dessert.category]) {
          // Match string category with ObjectId
          await Desserts.findByIdAndUpdate(dessert._id, { 
            category: categoryMap[dessert.category] 
          });
          results.desserts.updated++;
          console.log(`Updated dessert ${dessert.name} with category ${dessert.category}`);
        } else if (typeof dessert.category === 'string') {
          results.desserts.errors.push(`Category not found: ${dessert.category} for dessert: ${dessert.name}`);
        } else if (!dessert.category || dessert.category === null) {
          // Assign default category if no category or null
          if (defaultDessertCategory) {
            await Desserts.findByIdAndUpdate(dessert._id, { 
              category: defaultDessertCategory._id 
            });
            results.desserts.updated++;
            console.log(`Assigned default category to dessert ${dessert.name}`);
          }
        }
      } catch (error) {
        results.desserts.errors.push(`Error updating dessert ${dessert.name}: ${error.message}`);
        console.error(`Error updating dessert ${dessert.name}:`, error);
      }
    }

    // Update Hookahs
    const hookahs = await Hookahs.find();
    console.log(`Processing ${hookahs.length} hookahs...`);
    for (const hookah of hookahs) {
      try {
        if (typeof hookah.category === 'string' && categoryMap[hookah.category]) {
          // Match string category with ObjectId
          await Hookahs.findByIdAndUpdate(hookah._id, { 
            category: categoryMap[hookah.category] 
          });
          results.hookahs.updated++;
          console.log(`Updated hookah ${hookah.name} with category ${hookah.category}`);
        } else if (typeof hookah.category === 'string') {
          results.hookahs.errors.push(`Category not found: ${hookah.category} for hookah: ${hookah.name}`);
        } else if (!hookah.category || hookah.category === null) {
          // Assign default category if no category or null
          if (defaultHookahCategory) {
            await Hookahs.findByIdAndUpdate(hookah._id, { 
              category: defaultHookahCategory._id 
            });
            results.hookahs.updated++;
            console.log(`Assigned default category to hookah ${hookah.name}`);
          }
        }
      } catch (error) {
        results.hookahs.errors.push(`Error updating hookah ${hookah.name}: ${error.message}`);
        console.error(`Error updating hookah ${hookah.name}:`, error);
      }
    }

    // Calculate totals
    const totalUpdated = Object.values(results).reduce((sum, result) => sum + result.updated, 0);
    const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors.length, 0);

    res.status(200).json({
      message: "Product categories migration completed",
      totalUpdated: totalUpdated,
      totalErrors: totalErrors,
      availableCategories: Object.keys(categoryMap),
      defaultCategories: {
        foods: defaultFoodCategory?.name || 'Not found',
        drinks: defaultDrinkCategory?.name || 'Not found',
        desserts: defaultDessertCategory?.name || 'Not found',
        hookahs: defaultHookahCategory?.name || 'Not found'
      },
      details: results
    });

  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { migrateImages, seedCategories, migrateToCategory, assignDefaultCategories, migrateProductCategories }; 