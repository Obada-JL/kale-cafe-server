require("dotenv").config();
const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
// const projectController = require("./controllers/project-controller");
const dessertsController = require("./controllers/desserts-controller");
// const imagesController = require('./controllers/desserts-controller')
const foodsController = require("./controllers/foods-controller");
const drinksController = require("./controllers/drinks-controller");
const hookahsController = require("./controllers/hookah-controller");
const imagesController = require("./controllers/images-controller");
const SpecialImagesController = require("./controllers/special-images-controller");
const dessertImagesController = require("./controllers/dessert-images-controller");
const drinkImagesController = require("./controllers/drink-images-controller");
const foodImagesController = require("./controllers/food-images-controller");
const hookahImagesController = require("./controllers/hookah-images-controller");
const migrationController = require("./controllers/migration-controller");
const categoriesController = require("./controllers/categories-controller");
const userController = require("./controllers/user-controller");
const { auth, adminAuth, managerAuth } = require("./middleware/auth");
const app = express();
const url = process.env.MONGO_URL;

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/kale-cafe.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/kale-cafe.com/cert.pem"),
  ca: fs.readFileSync("/etc/letsencrypt/live/kale-cafe.com/chain.pem"),
};

// Create an HTTPS server with the SSL options
https.createServer(options, app).listen(444, () => {
  console.log("HTTPS server running on port 444");
});

// Optionally, redirect HTTP to HTTPS
const http = require("http");
http
  .createServer((req, res) => {
    res.writeHead(301, {
      Location: "https://" + req.headers["host"] + req.url,
    });
    res.end();
  })
  .listen(83);

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const fileName = `image-${Date.now()}.${ext}`;
    console.log("MIME type detected:", file.mimetype);
    cb(null, fileName);
  },
});
const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(new Error("File must be an image"), false);
  }
};

const upload = multer({ storage: diskStorage, fileFilter });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(cors());
app.use(express.json());

// Authentication routes (no auth required)
app.post("/api/auth/login", userController.login);
app.post("/api/auth/seed-admin", userController.seedAdmin);

// User routes (auth required)
app.get("/api/auth/profile", auth, userController.getProfile);
app.put("/api/auth/profile", auth, userController.updateProfile);
app.put("/api/auth/change-password", auth, userController.changePassword);

// Admin-only user management routes
app.post("/api/users", adminAuth, userController.register);
app.get("/api/users", adminAuth, userController.getUsers);
app.put("/api/users/:id", adminAuth, userController.updateUser);
app.delete("/api/users/:id", adminAuth, userController.deleteUser);

// categories routes
app.get("/api/getCategories", categoriesController.getCategories);
app.get("/api/getFoodCategories", categoriesController.getFoodCategories);
app.get("/api/getDrinkCategories", categoriesController.getDrinkCategories);
app.get("/api/getDessertCategories", categoriesController.getDessertCategories);
app.get("/api/getHookahCategories", categoriesController.getHookahCategories);
app.post("/api/addCategory", categoriesController.addCategory);
app.put("/api/updateCategory/:id", categoriesController.updateCategory);
app.delete("/api/deleteCategory/:id", categoriesController.deleteCategory);
app.post("/api/seedCategories", categoriesController.seedCategories);
// desserts routes
app.get("/api/getDesserts", dessertsController.getDesserts);
app.post("/api/addDessert", dessertsController.addDesserts);
app.put("/api/updateDessert/:id", dessertsController.updateDessert);
app.delete("/api/deleteDessert/:id", dessertsController.deleteDessert);
// drinks routes
app.get("/api/getDrinks", drinksController.getDrinks);
app.post("/api/addDrink", drinksController.addDrinks);
app.put("/api/updateDrink/:id", drinksController.updateDrink);
app.delete("/api/deleteDrink/:id", drinksController.deleteDrink);
app.get("/api/searchDrink", drinksController.SearchDrink);
// foods routes
app.get("/api/getFoods", foodsController.getfoods);
app.post("/api/addFood", foodsController.addfoods);
app.put("/api/updateFood/:id", foodsController.updatefood);
app.delete("/api/deleteFood/:id", foodsController.deletefood);
// hookahs routes
app.get("/api/gethookahs", hookahsController.getHookah);
app.post("/api/addhookah", hookahsController.addHookah);
app.put("/api/updatehookah/:id", hookahsController.updateHookah);
app.delete("/api/deletehookah/:id", hookahsController.deleteHookah);
// imagesRoutes
app.get("/api/getImages", imagesController.getImages);
app.post("/api/addImage", upload.single("file"), imagesController.addImage);
// Category-specific image routes
app.get("/api/getDessertImages", dessertImagesController.getDessertImages);
app.post("/api/addDessertImage", upload.single("file"), dessertImagesController.addDessertImage);
app.delete("/api/deleteDessertImage/:id", dessertImagesController.deleteDessertImage);

app.get("/api/getDrinkImages", drinkImagesController.getDrinkImages);
app.post("/api/addDrinkImage", upload.single("file"), drinkImagesController.addDrinkImage);
app.delete("/api/deleteDrinkImage/:id", drinkImagesController.deleteDrinkImage);

app.get("/api/getFoodImages", foodImagesController.getFoodImages);
app.post("/api/addFoodImage", upload.single("file"), foodImagesController.addFoodImage);
app.delete("/api/deleteFoodImage/:id", foodImagesController.deleteFoodImage);

app.get("/api/getHookahImages", hookahImagesController.getHookahImages);
app.post("/api/addHookahImage", upload.single("file"), hookahImagesController.addHookahImage);
app.delete("/api/deleteHookahImage/:id", hookahImagesController.deleteHookahImage);
// Migration routes
app.post("/api/migrateImages", migrationController.migrateImages);
app.post("/api/seedDefaultCategories", migrationController.seedCategories);
app.post("/api/migrateToCategoryId", migrationController.migrateToCategory);
app.post("/api/assignDefaultCategories", migrationController.assignDefaultCategories);
app.post("/api/migrateProductCategories", migrationController.migrateProductCategories);
// Special imagesRoutes
app.get("/api/getSpecialImages", SpecialImagesController.getSpecialImages);
app.post(
  "/api/addSpecialImage",
  upload.single("file"),
  SpecialImagesController.addSpecialImage
);
app.delete(
  "/api/deleteSpecialImage/:id",
  SpecialImagesController.deleteSpecialImage
);
// app.put(
//   "/api/updateImage/:id",
//   upload.single("file"),
//   imagesController.updateImage
// );
app.delete("/api/deleteImage/:id", imagesController.deleteImage);
// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
