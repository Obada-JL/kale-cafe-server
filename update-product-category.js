require("dotenv").config();
const mongoose = require("mongoose");

async function updateProductCategory() {
  try {
    // Connect to MongoDB and wait for connection
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    
    // Get the category ID for "المشروبات الغازية"
    const categoryResult = await mongoose.connection.db.collection('categories').findOne({
      name: "المشروبات الغازية"
    });
    
    if (!categoryResult) {
      console.log("Category 'المشروبات الغازية' not found");
      return;
    }
    
    console.log("Found category:", categoryResult.name, "with ID:", categoryResult._id);
    const categoryId = categoryResult._id;
    
    // Update the specific product "بايسون"
    const updateResult = await mongoose.connection.db.collection('drinks').updateOne(
      { _id: new mongoose.Types.ObjectId("674542f82092fdd5c77e5d4a") },
      { $set: { category: categoryId } }
    );
    
    console.log("Specific product update result:", updateResult);
    
    // Update all products that have string category "المشروبات الغازية"
    const bulkUpdateResult = await mongoose.connection.db.collection('drinks').updateMany(
      { category: "المشروبات الغازية" },
      { $set: { category: categoryId } }
    );
    
    console.log("Bulk update result for string categories:", bulkUpdateResult);
    
    // Update all products with null or no category to use the first drinks category
    const defaultUpdateResult = await mongoose.connection.db.collection('drinks').updateMany(
      { $or: [{ category: null }, { category: { $exists: false } }] },
      { $set: { category: categoryId } }
    );
    
    console.log("Default category assignment result:", defaultUpdateResult);
    
    console.log("Migration completed successfully!");
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

updateProductCategory(); 