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
const imagesController = require("./controllers/images-controller");
const SpecialImagesController = require("./controllers/special-images-controller");
const app = express();
const url = process.env.MONGO_URL;

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/kale-cafe.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/kale-cafe.com/cert.pem"),
  ca: fs.readFileSync("/etc/letsencrypt/live/kale-cafe.com/chain.pem"),
};

// Create an HTTPS server with the SSL options
https.createServer(options, app).listen(443, () => {
  console.log("HTTPS server running on port 443");
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
  .listen(80);

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
// imagesRoutes
app.get("/api/getImages", imagesController.getImages);
app.post("/api/addImage", upload.single("file"), imagesController.addImage);
// imagesRoutes
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
