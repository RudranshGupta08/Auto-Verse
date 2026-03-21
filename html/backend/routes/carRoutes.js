import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import Car from "../models/car.js";
import User from "../models/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// =========================
// 🔥 MULTER STORAGE
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = req.body.model.toLowerCase().replace(/\s+/g, "");
    const dir = path.join("images", folderName);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// =========================
// ✅ GET ALL CARS
// =========================
router.get("/", async (req, res) => {
  try {
    const { brand, type } = req.query;

    let filter = {};

    if (brand) filter.brand = new RegExp(brand, "i");
    if (type) filter.type = new RegExp(type, "i");

    const cars = await Car.find(filter).sort({ createdAt: -1 });

    res.json(cars);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// 🔍 FLEXIBLE SEARCH (FIXED POSITION)
// =========================
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query.trim();

    const words = query.split(" ").filter(w => w.length);

    const searchConditions = words.map(word => ({
      $or: [
        { brand: new RegExp(word, "i") },
        { model: new RegExp(word, "i") }
      ]
    }));

    const cars = await Car.find({
      $and: searchConditions
    });

    if (!cars.length) {
      return res.json({ found: false, cars: [] });
    }

    res.json({ found: true, cars });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// ✅ GET SINGLE CAR (AFTER SEARCH)
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
// ✅ ADD CAR
// =========================
router.post("/", upload.array("images", 20), async (req, res) => {
  try {
    const folderName = req.body.model.toLowerCase().replace(/\s+/g, "");

    const imagePaths = req.files.map(file =>
      `${folderName}/${file.filename}`
    );

    const newCar = new Car({
      brand: req.body.brand.trim(),
      model: req.body.model.trim(),
      type: req.body.type.trim().toLowerCase(),

      priceRange: req.body.priceRange,
      engineOptions: req.body.engineOptions?.split(",").map(s => s.trim()) || [],
      mileage: req.body.mileage,

      fuelType: req.body.fuelType?.split(",").map(s => s.trim()) || [],
      transmission: req.body.transmission?.split(",").map(s => s.trim()) || [],

      seatingCapacity: Number(req.body.seatingCapacity),
      images: imagePaths,

      description: req.body.description || "",
      features: req.body.features?.split(",").map(s => s.trim()) || [],
      pros: req.body.pros?.split(",").map(s => s.trim()) || [],
      cons: req.body.cons?.split(",").map(s => s.trim()) || [],

      verdict: req.body.verdict?.trim() || "",
      ncapRating: req.body.ncapRating,
      bestFor: req.body.bestFor
        ? req.body.bestFor.split(",").map(s => s.trim())
        : [],

      rating: Number(req.body.rating) || 3
    });

    await newCar.save();

    res.json({ success: true, message: "🚗 Car Added Successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// ✏️ UPDATE CAR
// =========================
router.put("/:id", upload.array("images", 20), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const updatedData = {
      brand: req.body.brand,
      model: req.body.model,
      type: req.body.type,

      priceRange: req.body.priceRange,
      engineOptions: req.body.engineOptions?.split(",").map(s => s.trim()) || [],
      mileage: req.body.mileage,

      fuelType: req.body.fuelType?.split(",").map(s => s.trim()) || [],
      transmission: req.body.transmission?.split(",").map(s => s.trim()) || [],

      seatingCapacity: Number(req.body.seatingCapacity),

      description: req.body.description || car.description,
      features: req.body.features?.split(",").map(s => s.trim()) || car.features,
      pros: req.body.pros?.split(",").map(s => s.trim()) || car.pros,
      cons: req.body.cons?.split(",").map(s => s.trim()) || car.cons,

      verdict: req.body.verdict?.trim() || car.verdict,
      ncapRating: req.body.ncapRating || car.ncapRating,
      bestFor: req.body.bestFor
        ? req.body.bestFor.split(",").map(s => s.trim())
        : car.bestFor,

      rating: Number(req.body.rating) || car.rating
    };

    if (req.files.length > 0) {
      updatedData.images = req.files.map(file =>
        `${req.body.model.toLowerCase().replace(/\s+/g, "")}/${file.filename}`
      );
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ success: true, message: "✏️ Car Updated", car: updatedCar });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// ❌ DELETE CAR
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "❌ Car Deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// ❤️ WISHLIST
// =========================
router.post("/wishlist/:id", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user.wishlist.includes(req.params.id)) {
    user.wishlist.push(req.params.id);
    await user.save();
  }

  res.json({ message: "Added to wishlist" });
});

router.get("/wishlist/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json(user.wishlist);
});

router.delete("/wishlist/:id", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  user.wishlist = user.wishlist.filter(
    carId => carId.toString() !== req.params.id
  );

  await user.save();

  res.json({ message: "Removed from wishlist" });
});

export default router;