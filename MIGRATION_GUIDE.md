# Migration Guide: Converting to CategoryId System

This guide explains how to migrate all existing products and images from using category names to using categoryId references.

## Migration Process

### Step 1: Seed Default Categories
First, create all the default categories in the database:

```bash
POST /api/seedDefaultCategories
```

This will create categories for:
- **Foods**: المقبلات, المأكولات الغربية, المشاوي, الوجبات الخفيفة, المأكولات الشرقية
- **Drinks**: الكوكتيلات, العصير الفريش, الفواكه, الميلك شيك, المشروبات الباردة, المشروبات الساخنة, مشروبات الفروزن, مشروب الموهيتو البارد, المشروبات الغازية, عصائر الديتوكس الباردة, أصناف مميزة
- **Desserts**: الحلويات, حلويات فرنسية, البوظة
- **Hookahs**: الأراكيل

### Step 2: Migrate All Products and Images
Run the comprehensive migration to update all existing data:

```bash
POST /api/migrateToCategoryId
```

This will:
- Update all **Foods** to use categoryId instead of category name
- Update all **Drinks** to use categoryId instead of category name  
- Update all **Desserts** to use categoryId instead of category name
- Update all **Hookahs** to use categoryId instead of category name
- Update all **Food Images** to use categoryId instead of category name
- Update all **Drink Images** to use categoryId instead of category name
- Update all **Dessert Images** to use categoryId instead of category name
- Update all **Hookah Images** to use categoryId instead of category name

### Step 3: Migrate Legacy Images (Optional)
If you have old images in the general images collection:

```bash
POST /api/migrateImages
```

## What the Migration Does

### Product Migration
- Finds all products with string category names
- Maps category names to their ObjectId references
- Updates each product's category field with the ObjectId
- Provides detailed error reporting for unmapped categories

### Image Migration  
- Finds all images with string category names
- Maps category names to their ObjectId references
- Updates each image's category field with the ObjectId
- Handles the schema changes (image → imagePath, etc.)

## Expected Response Format

```json
{
  "message": "Migration completed",
  "totalUpdated": 150,
  "totalErrors": 2,
  "availableCategories": ["المقبلات", "المأكولات الغربية", ...],
  "details": {
    "foods": { "updated": 25, "errors": [] },
    "drinks": { "updated": 30, "errors": [] },
    "desserts": { "updated": 15, "errors": [] },
    "hookahs": { "updated": 10, "errors": [] },
    "foodImages": { "updated": 20, "errors": [] },
    "drinkImages": { "updated": 25, "errors": [] },
    "dessertImages": { "updated": 15, "errors": [] },
    "hookahImages": { "updated": 10, "errors": ["Category not found: ..."] }
  }
}
```

## Error Handling

The migration process:
- ✅ Skips items that already have ObjectId categories
- ✅ Reports unmapped category names
- ✅ Continues processing even if individual items fail
- ✅ Provides detailed error reports per collection
- ✅ Shows total counts and available categories

## Post-Migration Verification

After migration, verify that:
1. All products have ObjectId category references
2. All images have ObjectId category references  
3. API endpoints return populated category data
4. Frontend can create/edit items with categoryId

## Rollback (If Needed)

If you need to rollback:
1. Stop the server
2. Restore database from backup
3. Or manually update category fields back to strings

## Notes

- ⚠️ **Backup your database before running migration**
- ✅ Migration is idempotent (safe to run multiple times)
- ✅ Only updates string categories, skips ObjectId categories
- ✅ Provides comprehensive error reporting
- ✅ Does not delete any existing data 