import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Car from "../models/car.js";

const router = express.Router();

// =========================
// 🔥 MULTER STORAGE (MODEL FOLDER)
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = req.body.model.toLowerCase().replace(/\s+/g, "");

    const dir = path.join("images", folderName);

    // ✅ Create folder if not exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname); // keep original name
  }
});

const upload = multer({ storage });

// =========================
// ✅ GET ALL CARS (WITH FILTER)
// =========================
router.get("/", async (req, res) => {
  try {
    const { brand, type } = req.query;

    let filter = {};

    if (brand) filter.brand = brand;
    if (type) filter.type = type;

    const cars = await Car.find(filter);

    res.json(cars);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// ✅ GET SINGLE CAR BY ID (🔥 IMPORTANT)
// =========================
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json(car);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// ✅ ADD CAR WITH IMAGES
// =========================
router.post("/", upload.array("images", 20), async (req, res) => {
  try {
    const folderName = req.body.model.toLowerCase().replace(/\s+/g, "");

    const imagePaths = req.files.map(file =>
      `${folderName}/${file.originalname}`
    );

    const newCar = new Car({
      brand: req.body.brand,
      model: req.body.model,
      type: req.body.type,

      priceRange: req.body.priceRange,
      engineOptions: req.body.engineOptions?.split(",") || [],
      mileage: req.body.mileage,

      fuelType: req.body.fuelType?.split(",") || [],
      transmission: req.body.transmission?.split(",") || [],

      seatingCapacity: req.body.seatingCapacity,

      images: imagePaths,

      // 🔥 OPTIONAL FIELDS FOR DETAIL PAGE
      features: req.body.features?.split(",") || [],
      pros: req.body.pros?.split(",") || [],
      cons: req.body.cons?.split(",") || [],
      verdict: req.body.verdict || ""
    });

    await newCar.save();

    res.json({
      success: true,
      message: "🚗 Car Added Successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;