import mongoose from "mongoose";

/* ===== VARIANT SCHEMA ===== */
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  price: {
    type: String,
    required: true
  },

  fuelType: {
    type: String,
    required: true
  },

  transmission: {
    type: String,
    required: true
  },

  mileage: {
    type: String,
    default: ""
  },

  features: {
    type: [String],
    default: []
  },

  isBestValue: {
    type: Boolean,
    default: false
  }
});


/* ===== MAIN CAR SCHEMA ===== */
const carSchema = new mongoose.Schema({

  brand: { type: String, required: true },
  model: { type: String, required: true },
  type: { type: String },

  priceRange: { type: String },

  engineOptions: { type: [String], default: [] },
  mileage: { type: String },

  fuelType: { type: [String], default: [] },
  transmission: { type: [String], default: [] },

  seatingCapacity: { type: Number },

  rating: { type: Number, default: 3 },
  ncapRating: { type: String, default: "Not Rated" },

  /* ===== SMART INFO (YOUR EXISTING GOOD FIELDS) ===== */
  bestFor: { type: [String], default: [] },
  description: { type: String },

  features: { type: [String], default: [] },

  pros: { type: [String], default: [] },
  cons: { type: [String], default: [] },

  verdict: { type: String, default: "" },

  /* ===== IMAGES ===== */
  images: { type: [String], default: [] },

  /* 🔥 NEW: VARIANTS (IMPORTANT FEATURE) */
  variants: {
    type: [variantSchema],
    default: []
  }

}, {
  timestamps: true
});

export default mongoose.model("Car", carSchema);