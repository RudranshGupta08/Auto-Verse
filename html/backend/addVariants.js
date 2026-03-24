import mongoose from "mongoose";
import dotenv from "dotenv"
import Car from "./models/car.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log("DB:", mongoose.connection.name);

// =========================
// 🔥 ALL MARUTI SUV VARIANTS
// =========================

const updates = [

    // ================= BREZZA =================
    {
        brand: "Maruti",
        model: "Brezza",
        variants: [
            {
                name: "LXI",
                price: "₹8.5L",
                fuelType: "Petrol",
                transmission: "Manual",
                mileage: "17 kmpl",
                features: ["Basic infotainment", "Dual airbags"],
                isBestValue: false
            },
            {
                name: "VXI",
                price: "₹10L",
                fuelType: "Petrol",
                transmission: "Manual",
                mileage: "18 kmpl",
                features: ["Touchscreen", "Steering controls"],
                isBestValue: true
            },
            {
                name: "ZXI",
                price: "₹12.5L",
                fuelType: "Petrol",
                transmission: "Automatic",
                mileage: "19 kmpl",
                features: ["Alloy wheels", "LED DRL"],
                isBestValue: false
            }
        ]
    },

    // ================= GRAND VITARA =================
    {
        brand: "Maruti",
        model: "Grand Vitara",
        variants: [
            {
                name: "Sigma",
                price: "₹11L",
                fuelType: "Petrol",
                transmission: "Manual",
                mileage: "20 kmpl",
                features: ["LED DRL", "Basic infotainment"],
                isBestValue: false
            },
            {
                name: "Delta",
                price: "₹13L",
                fuelType: "Petrol",
                transmission: "Manual",
                mileage: "21 kmpl",
                features: ["Touchscreen", "Alloy wheels"],
                isBestValue: true
            },
            {
                name: "Zeta Hybrid",
                price: "₹18L",
                fuelType: "Hybrid",
                transmission: "Automatic",
                mileage: "27 kmpl",
                features: ["Hybrid system", "Premium interior"],
                isBestValue: false
            }
        ]
    },

    // ================= FRONX =================
    {
        brand: "Maruti",
        model: "Fronx",
        variants: [
            {
                name: "Sigma",
                price: "₹7.5L",
                fuelType: "Petrol",
                transmission: "Manual",
                mileage: "20 kmpl",
                features: ["Basic features"],
                isBestValue: false
            },
            {
                name: "Delta",
                price: "₹9L",
                fuelType: "Petrol",
                transmission: "Manual",
                mileage: "21 kmpl",
                features: ["Touchscreen", "Smart features"],
                isBestValue: true
            },
            {
                name: "Alpha Turbo",
                price: "₹12.5L",
                fuelType: "Petrol",
                transmission: "AMT",
                mileage: "22 kmpl",
                features: ["HUD", "Turbo engine"],
                isBestValue: false
            }
        ]
    },

    // ================= JIMNY =================
    {
        brand: "Maruti",
        model: "Jimny",
        variants: [
            {
                name: "Zeta",
                price: "₹12L",
                fuelType: "Petrol",
                transmission: "Manual",
                mileage: "16 kmpl",
                features: ["4x4", "Basic features"],
                isBestValue: true
            },
            {
                name: "Alpha",
                price: "₹14.5L",
                fuelType: "Petrol",
                transmission: "Automatic",
                mileage: "16 kmpl",
                features: ["Alloy wheels", "Touchscreen"],
                isBestValue: false
            }
        ]
    }

];

const allCars = await Car.find();

console.log("🔥 DB DATA:");
allCars.forEach(c => {
  console.log(`Brand: "${c.brand}" | Model: "${c.model}"`);
});

// =========================
// 🔥 UPDATE LOOP
// =========================

for (const item of updates) {

  const result = await Car.updateOne(
    {
      model: { $regex: new RegExp(`^${item.model}$`, "i") }
    },
    {
      $set: { variants: item.variants }
    }
  );

  console.log(`Updating: ${item.model}`);
  console.log(result);
}

console.log("🚀 All Maruti SUV variants added successfully");
process.exit();