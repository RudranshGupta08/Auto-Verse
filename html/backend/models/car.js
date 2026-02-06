import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  type: { type: String, required: true },
  variants: { type: [String], default: [] },
  priceRange: { type: String, default: "" },      // Must match DB key
  engineOptions: { type: [String], default: [] }, // Must match DB key
  mileage: { type: String, default: "" },
  fuelType: { type: [String], default: [] },      // Must be Array
  transmission: { type: [String], default: [] },  // Must be Array
  seatingCapacity: { type: String, default: "" },
  images: { type: [String], default: [] }
}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);
export default Car;