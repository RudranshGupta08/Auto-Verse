import mongoose from "mongoose";
import Car from '../../models/car.js';
import dotenv from "dotenv";

dotenv.config();

/* =========================
   PRICE PARSER
========================= */
function parsePrice(priceRange) {
  if (!priceRange) {
    return {
      minPrice: 0,
      maxPrice: 0
    };
  }

  const matches = priceRange.match(/\d+(\.\d+)?/g);

  if (!matches || matches.length < 2) {
    return {
      minPrice: 0,
      maxPrice: 0
    };
  }

  return {
    minPrice: Math.round(parseFloat(matches[0]) * 100000),
    maxPrice: Math.round(parseFloat(matches[1]) * 100000)
  };
}

/* =========================
   MILEAGE PARSER
========================= */
function parseMileage(mileage) {
  if (!mileage) return 0;

  const matches = mileage.match(/\d+/g);

  if (!matches) return 0;

  return Math.max(...matches.map(Number));
}

/* =========================
   KEYWORDS
========================= */
function generateKeywords(car) {
  return [
    car.brand,
    car.model,
    `${car.brand} ${car.model}`,
    car.type,
    ...(car.bestFor || []),
    ...(car.fuelType || [])
  ].filter(Boolean);
}

/* =========================
   AI TAGS
========================= */
function generateAiTags(car) {
  const tags = [];

  if (car.type) {
    tags.push(car.type);
  }

  if (car.bestFor?.length) {
    tags.push(...car.bestFor);
  }

  if (
    car.fuelType &&
    car.fuelType.includes("CNG")
  ) {
    tags.push("Economical");
  }

  if (
    car.mileage &&
    parseMileage(car.mileage) >= 20
  ) {
    tags.push("Fuel Efficient");
  }

  if (
    Number(car.seatingCapacity) >= 7
  ) {
    tags.push("Family");
    tags.push("7 Seater");
  }

  return [...new Set(tags)];
}

/* =========================
   DB CONNECT
========================= */
mongoose.connect(process.env.MONGO_URI)
.then(async () => {

  const cars = await Car.find();

  console.log(
    `🚗 Found ${cars.length} cars`
  );

  for (const car of cars) {

    const priceData = parsePrice(
      car.priceRange
    );

    /* =========================
       KEEP EXISTING DATA
    ========================= */

    if (!car.bestFor) {
      car.bestFor = [];
    }

    if (!car.verdict) {
      car.verdict = "";
    }

    if (!car.pros) {
      car.pros = [];
    }

    if (!car.cons) {
      car.cons = [];
    }

    if (!car.features) {
      car.features = [];
    }

    if (!car.variants) {
      car.variants = [];
    }

    /* =========================
       NEW AI FIELDS
    ========================= */

    car.bodyType =
      car.bodyType || car.type || "";

    car.minPrice =
      car.minPrice || priceData.minPrice;

    car.maxPrice =
      car.maxPrice || priceData.maxPrice;

    car.fuelEconomy =
      car.fuelEconomy ||
      parseMileage(car.mileage);

    car.keywords =
      generateKeywords(car);

    car.aiTags =
      generateAiTags(car);

    await car.save();

    console.log(
      `✅ Updated: ${car.brand} ${car.model}`
    );
  }

  console.log(
    "\n🎉 AutoVerse AI Migration Complete"
  );

  process.exit();

})
.catch(err => {
  console.error(
    "❌ Migration Error:",
    err
  );
});