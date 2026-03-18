import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  type: String,

  priceRange: String,
  engineOptions: [String],
  mileage: String,
  fuelType: [String],
  transmission: [String],

  seatingCapacity: String, // matches your DB
  images: [String]
});

export default mongoose.model('Car', carSchema);