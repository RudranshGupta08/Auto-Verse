import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  type: { type: String },
  priceRange: { type: String },
  engineOptions: { type: [String] },
  mileage: { type: String },
  fuelType: { type: [String] },
  transmission: { type: [String] },
  seatingCapacity: { type: Number },
  rating: { type: Number, default: 3 },
  ncapRating: { type: String, default: "Not Rated" },
  bestFor: { type: [String], default: [] },       // ✅ Add this
  description: { type: String },
  features: { type: [String], default: [] },
  pros: { type: [String], default: [] },
  cons: { type: [String], default: [] },
  verdict: { type: String, default: "" },         // ✅ Add this
  images: { type: [String], default: [] }
});

export default mongoose.model("Car", carSchema);