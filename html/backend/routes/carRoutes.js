import express from 'express';
import Car from '../models/car.js';

const router = express.Router();


// 🔍 GET ALL / FILTER CARS
router.get('/', async (req, res) => {
  try {
    console.log("👉 Query:", req.query);

    let filter = {};

    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.type) filter.type = req.query.type;

    const cars = await Car.find(filter);

    console.log("✅ Cars Found:", cars.length);

    res.json(cars);

  } catch (error) {
    console.error("🔥 REAL ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});


// ➕ ADD NEW CAR (ADMIN)
router.post('/', async (req, res) => {
  try {
    console.log("📦 Incoming Data:", req.body);

    const newCar = new Car({
      brand: req.body.brand,
      model: req.body.model,
      type: req.body.type,
      priceRange: req.body.priceRange,
      engineOptions: req.body.engineOptions || [],
      mileage: req.body.mileage,
      fuelType: req.body.fuelType || [],
      transmission: req.body.transmission || [],
      seatingCapacity: req.body.seatingCapacity,
      images: req.body.images || []
    });

    await newCar.save();

    console.log("✅ Car Saved:", newCar.model);

    res.status(201).json({
      message: "Car added successfully",
      car: newCar
    });

  } catch (error) {
    console.error("🔥 ADD ERROR:", error.message);

    res.status(500).json({
      message: "Error adding car",
      error: error.message
    });
  }
});


// 🖼️ ADD IMAGES TO EXISTING CAR (IMPORTANT)
router.put('/add-images/:model', async (req, res) => {
  try {
    const { images } = req.body;

    console.log("📸 Adding images to:", req.params.model);

    const updatedCar = await Car.findOneAndUpdate(
      { model: req.params.model },
      { $push: { images: { $each: images } } },
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    console.log("✅ Images Added");

    res.json({
      message: "Images added successfully",
      car: updatedCar
    });

  } catch (error) {
    console.error("🔥 IMAGE ADD ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});


// ❌ DELETE CAR
router.delete('/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);

    console.log("🗑️ Car Deleted:", req.params.id);

    res.json({ message: "Car deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;