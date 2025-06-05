require("dotenv").config();
const mongoose = require("mongoose");

async function migrateAllCategories() {
  try {
    // Connect to MongoDB and wait for connection
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    
    // Define all categories to migrate
    const categoriesToMigrate = {
      foods: [
        "المقبلات",
        "المأكولات الغربية",
        "المشاوي",
        "الوجبات الخفيفة",
        "المأكولات الشرقية"
      ],
      drinks: [
        "الكوكتيلات",
        "العصير الفريش",
        "الفواكه",
        "الميلك شيك",
        "المشروبات الباردة",
        "المشروبات الساخنة",
        "مشروبات الفروزن",
        "مشروب الموهيتو البارد",
        "المشروبات الغازية",
        "عصائر الديتوكس الباردة",
        "أصناف مميزة"
      ],
      desserts: [
        "الحلويات",
        "حلويات فرنسية",
        "البوظة"
      ],
      hookahs: [
        "الأراكيل"
      ]
    };

    // Get all categories from database and create mapping
    const allCategories = await mongoose.connection.db.collection('categories').find().toArray();
    const categoryMap = {};
    
    allCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    console.log("Available categories:", Object.keys(categoryMap));

    let totalResults = {
      foods: { updated: 0, errors: [], skipped: 0 },
      drinks: { updated: 0, errors: [], skipped: 0 },
      desserts: { updated: 0, errors: [], skipped: 0 },
      hookahs: { updated: 0, errors: [], skipped: 0 }
    };

    // Migrate Foods
    console.log("\n=== MIGRATING FOODS ===");
    const foods = await mongoose.connection.db.collection('foods').find().toArray();
    console.log(`Found ${foods.length} foods to process`);
    
    for (const food of foods) {
      try {
        if (typeof food.category === 'string') {
          if (categoryMap[food.category]) {
            const updateResult = await mongoose.connection.db.collection('foods').updateOne(
              { _id: food._id },
              { $set: { category: categoryMap[food.category] } }
            );
            totalResults.foods.updated += updateResult.modifiedCount;
            console.log(`✅ Updated food "${food.name}" from category "${food.category}"`);
          } else {
            totalResults.foods.errors.push(`Category not found: ${food.category} for food: ${food.name}`);
            console.log(`❌ Category "${food.category}" not found for food "${food.name}"`);
          }
        } else if (!food.category || food.category === null) {
          // Assign default category for foods without category
          const defaultCategory = categoryMap["الوجبات الخفيفة"];
          if (defaultCategory) {
            const updateResult = await mongoose.connection.db.collection('foods').updateOne(
              { _id: food._id },
              { $set: { category: defaultCategory } }
            );
            totalResults.foods.updated += updateResult.modifiedCount;
            console.log(`🔄 Assigned default category to food "${food.name}"`);
          }
        } else {
          totalResults.foods.skipped++;
          console.log(`⏭️ Skipped food "${food.name}" - already has ObjectId category`);
        }
      } catch (error) {
        totalResults.foods.errors.push(`Error updating food ${food.name}: ${error.message}`);
        console.error(`❌ Error updating food ${food.name}:`, error.message);
      }
    }

    // Migrate Drinks
    console.log("\n=== MIGRATING DRINKS ===");
    const drinks = await mongoose.connection.db.collection('drinks').find().toArray();
    console.log(`Found ${drinks.length} drinks to process`);
    
    for (const drink of drinks) {
      try {
        if (typeof drink.category === 'string') {
          if (categoryMap[drink.category]) {
            const updateResult = await mongoose.connection.db.collection('drinks').updateOne(
              { _id: drink._id },
              { $set: { category: categoryMap[drink.category] } }
            );
            totalResults.drinks.updated += updateResult.modifiedCount;
            console.log(`✅ Updated drink "${drink.name}" from category "${drink.category}"`);
          } else {
            totalResults.drinks.errors.push(`Category not found: ${drink.category} for drink: ${drink.name}`);
            console.log(`❌ Category "${drink.category}" not found for drink "${drink.name}"`);
          }
        } else if (!drink.category || drink.category === null) {
          // Assign default category for drinks without category
          const defaultCategory = categoryMap["المشروبات الباردة"];
          if (defaultCategory) {
            const updateResult = await mongoose.connection.db.collection('drinks').updateOne(
              { _id: drink._id },
              { $set: { category: defaultCategory } }
            );
            totalResults.drinks.updated += updateResult.modifiedCount;
            console.log(`🔄 Assigned default category to drink "${drink.name}"`);
          }
        } else {
          totalResults.drinks.skipped++;
          console.log(`⏭️ Skipped drink "${drink.name}" - already has ObjectId category`);
        }
      } catch (error) {
        totalResults.drinks.errors.push(`Error updating drink ${drink.name}: ${error.message}`);
        console.error(`❌ Error updating drink ${drink.name}:`, error.message);
      }
    }

    // Migrate Desserts
    console.log("\n=== MIGRATING DESSERTS ===");
    const desserts = await mongoose.connection.db.collection('desserts').find().toArray();
    console.log(`Found ${desserts.length} desserts to process`);
    
    for (const dessert of desserts) {
      try {
        if (typeof dessert.category === 'string') {
          if (categoryMap[dessert.category]) {
            const updateResult = await mongoose.connection.db.collection('desserts').updateOne(
              { _id: dessert._id },
              { $set: { category: categoryMap[dessert.category] } }
            );
            totalResults.desserts.updated += updateResult.modifiedCount;
            console.log(`✅ Updated dessert "${dessert.name}" from category "${dessert.category}"`);
          } else {
            totalResults.desserts.errors.push(`Category not found: ${dessert.category} for dessert: ${dessert.name}`);
            console.log(`❌ Category "${dessert.category}" not found for dessert "${dessert.name}"`);
          }
        } else if (!dessert.category || dessert.category === null) {
          // Assign default category for desserts without category
          const defaultCategory = categoryMap["الحلويات"];
          if (defaultCategory) {
            const updateResult = await mongoose.connection.db.collection('desserts').updateOne(
              { _id: dessert._id },
              { $set: { category: defaultCategory } }
            );
            totalResults.desserts.updated += updateResult.modifiedCount;
            console.log(`🔄 Assigned default category to dessert "${dessert.name}"`);
          }
        } else {
          totalResults.desserts.skipped++;
          console.log(`⏭️ Skipped dessert "${dessert.name}" - already has ObjectId category`);
        }
      } catch (error) {
        totalResults.desserts.errors.push(`Error updating dessert ${dessert.name}: ${error.message}`);
        console.error(`❌ Error updating dessert ${dessert.name}:`, error.message);
      }
    }

    // Migrate Hookahs
    console.log("\n=== MIGRATING HOOKAHS ===");
    const hookahs = await mongoose.connection.db.collection('hookahs').find().toArray();
    console.log(`Found ${hookahs.length} hookahs to process`);
    
    for (const hookah of hookahs) {
      try {
        if (typeof hookah.category === 'string') {
          if (categoryMap[hookah.category]) {
            const updateResult = await mongoose.connection.db.collection('hookahs').updateOne(
              { _id: hookah._id },
              { $set: { category: categoryMap[hookah.category] } }
            );
            totalResults.hookahs.updated += updateResult.modifiedCount;
            console.log(`✅ Updated hookah "${hookah.name}" from category "${hookah.category}"`);
          } else {
            totalResults.hookahs.errors.push(`Category not found: ${hookah.category} for hookah: ${hookah.name}`);
            console.log(`❌ Category "${hookah.category}" not found for hookah "${hookah.name}"`);
          }
        } else if (!hookah.category || hookah.category === null) {
          // Assign default category for hookahs without category
          const defaultCategory = categoryMap["الأراكيل"];
          if (defaultCategory) {
            const updateResult = await mongoose.connection.db.collection('hookahs').updateOne(
              { _id: hookah._id },
              { $set: { category: defaultCategory } }
            );
            totalResults.hookahs.updated += updateResult.modifiedCount;
            console.log(`🔄 Assigned default category to hookah "${hookah.name}"`);
          }
        } else {
          totalResults.hookahs.skipped++;
          console.log(`⏭️ Skipped hookah "${hookah.name}" - already has ObjectId category`);
        }
      } catch (error) {
        totalResults.hookahs.errors.push(`Error updating hookah ${hookah.name}: ${error.message}`);
        console.error(`❌ Error updating hookah ${hookah.name}:`, error.message);
      }
    }

    // Print summary
    const totalUpdated = Object.values(totalResults).reduce((sum, result) => sum + result.updated, 0);
    const totalErrors = Object.values(totalResults).reduce((sum, result) => sum + result.errors.length, 0);
    const totalSkipped = Object.values(totalResults).reduce((sum, result) => sum + result.skipped, 0);

    console.log("\n" + "=".repeat(50));
    console.log("MIGRATION SUMMARY");
    console.log("=".repeat(50));
    console.log(`📊 Total Updated: ${totalUpdated}`);
    console.log(`⏭️ Total Skipped: ${totalSkipped}`);
    console.log(`❌ Total Errors: ${totalErrors}`);
    console.log("\nBreakdown by collection:");
    console.log(`  Foods: ${totalResults.foods.updated} updated, ${totalResults.foods.skipped} skipped, ${totalResults.foods.errors.length} errors`);
    console.log(`  Drinks: ${totalResults.drinks.updated} updated, ${totalResults.drinks.skipped} skipped, ${totalResults.drinks.errors.length} errors`);
    console.log(`  Desserts: ${totalResults.desserts.updated} updated, ${totalResults.desserts.skipped} skipped, ${totalResults.desserts.errors.length} errors`);
    console.log(`  Hookahs: ${totalResults.hookahs.updated} updated, ${totalResults.hookahs.skipped} skipped, ${totalResults.hookahs.errors.length} errors`);

    if (totalErrors > 0) {
      console.log("\n❌ ERRORS:");
      Object.entries(totalResults).forEach(([collection, result]) => {
        if (result.errors.length > 0) {
          console.log(`  ${collection.toUpperCase()}:`);
          result.errors.forEach(error => console.log(`    - ${error}`));
        }
      });
    }

    console.log("\n✅ Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

migrateAllCategories(); 