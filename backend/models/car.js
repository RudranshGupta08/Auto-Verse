import mongoose from "mongoose";

/* =========================
   VARIANT SCHEMA
========================= */
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

/* =========================
   MAIN CAR SCHEMA
========================= */
const carSchema = new mongoose.Schema({

  /* BASIC INFO */
  brand: {
    type: String,
    required: true,
    index: true
  },

  model: {
    type: String,
    required: true,
    index: true
  },

  type: {
    type: String,
    default: ""
  },

  bodyType: {
    type: String,
    default: ""
  },

  /* PRICE */
  priceRange: {
    type: String,
    default: ""
  },

  minPrice: {
    type: Number,
    default: 0
  },

  maxPrice: {
    type: Number,
    default: 0
  },

  /* ENGINE */
  engineOptions: {
    type: [String],
    default: []
  },

  engineCapacity: {
    type: String,
    default: ""
  },

  power: {
    type: String,
    default: ""
  },

  torque: {
    type: String,
    default: ""
  },

  /* FUEL */
  fuelType: {
    type: [String],
    default: []
  },

  isEV: {
    type: Boolean,
    default: false
  },

  batteryCapacity: {
    type: String,
    default: ""
  },

  range: {
    type: String,
    default: ""
  },

  chargingTime: {
    type: String,
    default: ""
  },

  mileage: {
    type: String,
    default: ""
  },

  fuelEconomy: {
    type: Number,
    default: 0
  },

  /* TRANSMISSION */
  transmission: {
    type: [String],
    default: []
  },

  drivetrain: {
    type: String,
    default: ""
  },

  /* DIMENSIONS */
  seatingCapacity: {
    type: Number,
    default: 5
  },

  bootSpace: {
    type: String,
    default: ""
  },

  groundClearance: {
    type: String,
    default: ""
  },

  wheelbase: {
    type: String,
    default: ""
  },

  /* SAFETY */
  rating: {
    type: Number,
    default: 3
  },

  ncapRating: {
    type: String,
    default: "Not Rated"
  },

  airbags: {
    type: Number,
    default: 0
  },

  adas: {
    type: Boolean,
    default: false
  },

  safetyFeatures: {
    type: [String],
    default: []
  },

  /* FEATURES */
  features: {
    type: [String],
    default: []
  },

  infotainment: {
    type: String,
    default: ""
  },

  connectedCarTech: {
    type: Boolean,
    default: false
  },

  sunroof: {
    type: Boolean,
    default: false
  },

  panoramicSunroof: {
    type: Boolean,
    default: false
  },

  ventilatedSeats: {
    type: Boolean,
    default: false
  },

  /* SMART INFO */
  bestFor: {
    type: [String],
    default: []
  },

  pros: {
    type: [String],
    default: []
  },

  cons: {
    type: [String],
    default: []
  },

  verdict: {
    type: String,
    default: ""
  },

  description: {
    type: String,
    default: ""
  },

  /* AI TAGS */
  aiTags: {
    type: [String],
    default: []
  },

  keywords: {
    type: [String],
    default: []
  },

  /* IMAGES */
  images: {
    type: [String],
    default: []
  },

  /* VARIANTS */
  variants: {
    type: [variantSchema],
    default: []
  },

  /* MARKET DATA */
  launchDate: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    default: "Active"
  },

  /* SEO */
  slug: {
    type: String,
    unique: true,
    sparse: true
  }

}, {
  timestamps: true
});

/* =========================
   INDEXES FOR AI SEARCH
========================= */

carSchema.index({
  brand: "text",
  model: "text",
  bodyType: "text",
  description: "text",
  aiTags: "text",
  keywords: "text"
});

export default mongoose.model("Car", carSchema);