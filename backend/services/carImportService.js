import Car from "../models/car.js";

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

function cleanString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function cleanArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map(item => cleanString(item))
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "yes", "1"].includes(
      value.toLowerCase().trim()
    );
  }

  return Boolean(value);
}

function toNumber(value, fallback = 0) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

/* =========================================================
   CAR KEY
========================================================= */

export function generateCarKey(brand, model) {
  return `${brand}-${model}`
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================================
   PRICE PARSER
========================================================= */

function parsePriceRange(priceRange) {
  const value = cleanString(priceRange);

  if (!value) {
    return {
      minPrice: 0,
      maxPrice: 0
    };
  }

  const matches = value.match(/\d+(\.\d+)?/g);

  if (!matches) {
    return {
      minPrice: 0,
      maxPrice: 0
    };
  }

  const prices = matches.map(
    number => Number(number) * 100000
  );

  return {
    minPrice: Math.round(prices[0] || 0),
    maxPrice: Math.round(
      prices[1] || prices[0] || 0
    )
  };
}

/* =========================================================
   MILEAGE PARSER
========================================================= */

function parseMileage(mileage) {
  const value = cleanString(mileage);

  if (!value) {
    return 0;
  }

  const matches = value.match(/\d+(\.\d+)?/g);

  if (!matches) {
    return 0;
  }

  return Math.max(
    ...matches.map(Number)
  );
}

/* =========================================================
   AI TAG GENERATOR
========================================================= */

function generateAiTags(car) {
  const tags = [];

  if (car.bodyType) {
    tags.push(car.bodyType);
  }

  if (car.bestFor?.length) {
    tags.push(...car.bestFor);
  }

  if (car.fuelType?.includes("CNG")) {
    tags.push("Economical");
  }

  if (car.fuelEconomy >= 20) {
    tags.push("Fuel Efficient");
  }

  if (car.isEV) {
    tags.push("Electric");
    tags.push("EV");
  }

  if (car.seatingCapacity >= 7) {
    tags.push("Family");
    tags.push("7 Seater");
  }

  if (car.adas) {
    tags.push("ADAS");
  }

  return [...new Set(tags)];
}

/* =========================================================
   KEYWORD GENERATOR
========================================================= */

function generateKeywords(car) {
  return [
    car.brand,
    car.model,
    `${car.brand} ${car.model}`,
    car.type,
    car.bodyType,
    ...car.bestFor,
    ...car.fuelType,
    ...car.transmission,
    ...car.aiTags
  ]
    .map(cleanString)
    .filter(Boolean);
}

/* =========================================================
   VARIANT NORMALIZER
========================================================= */

function normalizeVariants(variants) {
  if (!Array.isArray(variants)) {
    return [];
  }

  return variants.map(variant => ({
    name: cleanString(variant.name),

    price: cleanString(variant.price),

    fuelType: cleanString(variant.fuelType),

    transmission: cleanString(
      variant.transmission
    ),

    mileage: cleanString(
      variant.mileage
    ),

    features: cleanArray(
      variant.features
    ),

    isBestValue: toBoolean(
      variant.isBestValue
    )
  }));
}

/* =========================================================
   CAR NORMALIZER
========================================================= */

export function normalizeCar(rawCar) {
  const brand = cleanString(rawCar.brand);
  const model = cleanString(rawCar.model);

  if (!brand) {
    throw new Error(
      "Car brand is required."
    );
  }

  if (!model) {
    throw new Error(
      "Car model is required."
    );
  }

  const priceRange =
    cleanString(rawCar.priceRange);

  const priceData =
    parsePriceRange(priceRange);

  const fuelType =
    cleanArray(rawCar.fuelType);

  const transmission =
    cleanArray(rawCar.transmission);

  const bodyType =
    cleanString(
      rawCar.bodyType ||
      rawCar.type
    );

  const fuelEconomy =
    toNumber(
      rawCar.fuelEconomy,
      parseMileage(rawCar.mileage)
    );

  const car = {
    brand,

    model,

    type:
      cleanString(rawCar.type) ||
      bodyType,

    bodyType,

    priceRange,

    minPrice:
      toNumber(
        rawCar.minPrice,
        priceData.minPrice
      ),

    maxPrice:
      toNumber(
        rawCar.maxPrice,
        priceData.maxPrice
      ),

    engineOptions:
      cleanArray(
        rawCar.engineOptions
      ),

    engineCapacity:
      cleanString(
        rawCar.engineCapacity
      ),

    power:
      cleanString(rawCar.power),

    torque:
      cleanString(rawCar.torque),

    fuelType,

    isEV:
      rawCar.isEV !== undefined
        ? toBoolean(rawCar.isEV)
        : fuelType.some(
          fuel =>
            fuel.toLowerCase() ===
            "electric"
        ),

    batteryCapacity:
      cleanString(
        rawCar.batteryCapacity
      ),

    range:
      cleanString(rawCar.range),

    chargingTime:
      cleanString(
        rawCar.chargingTime
      ),

    mileage:
      cleanString(rawCar.mileage),

    fuelEconomy,

    transmission,

    drivetrain:
      cleanString(
        rawCar.drivetrain
      ),

    seatingCapacity:
      toNumber(
        rawCar.seatingCapacity,
        5
      ),

    bootSpace:
      cleanString(rawCar.bootSpace),

    groundClearance:
      cleanString(
        rawCar.groundClearance
      ),

    wheelbase:
      cleanString(rawCar.wheelbase),

    rating:
      toNumber(
        rawCar.rating,
        3
      ),

    ncapRating:
      cleanString(
        rawCar.ncapRating
      ) || "Not Rated",

    airbags:
      toNumber(
        rawCar.airbags,
        0
      ),

    adas:
      toBoolean(rawCar.adas),

    safetyFeatures:
      cleanArray(
        rawCar.safetyFeatures
      ),

    features:
      cleanArray(
        rawCar.features
      ),

    infotainment:
      cleanString(
        rawCar.infotainment
      ),

    connectedCarTech:
      toBoolean(
        rawCar.connectedCarTech
      ),

    sunroof:
      toBoolean(
        rawCar.sunroof
      ),

    panoramicSunroof:
      toBoolean(
        rawCar.panoramicSunroof
      ),

    ventilatedSeats:
      toBoolean(
        rawCar.ventilatedSeats
      ),

    bestFor:
      cleanArray(
        rawCar.bestFor
      ),

    pros:
      cleanArray(
        rawCar.pros
      ),

    cons:
      cleanArray(
        rawCar.cons
      ),

    verdict:
      cleanString(
        rawCar.verdict
      ),

    description:
      cleanString(
        rawCar.description
      ),

    aiTags: [],

    keywords: [],

    images:
      cleanArray(
        rawCar.images
      ),

    variants:
      normalizeVariants(
        rawCar.variants
      ),

    launchDate:
      cleanString(
        rawCar.launchDate
      ),

    status:
      cleanString(
        rawCar.status
      ) || "Active",

    slug:
      cleanString(
        rawCar.slug
      ) || generateCarKey(
        brand,
        model
      )
  };

  car.aiTags =
    generateAiTags(car);

  car.keywords =
    generateKeywords({
      ...car,
      aiTags: car.aiTags
    });

  return car;
}

/* =========================================================
   UPSERT SINGLE CAR
========================================================= */

export async function upsertCar(rawCar) {
  const car =
    normalizeCar(rawCar);

  const carKey =
    generateCarKey(
      car.brand,
      car.model
    );

  /*
   * First try the stable carKey.
   *
   * Existing legacy cars may not have carKey,
   * therefore we also fall back to brand + model.
   */

  let existingCar = await Car.findOne({
    $or: [
      { carKey },
      {
        brand: car.brand,
        model: car.model
      }
    ]
  });

  if (existingCar) {
    Object.assign(
      existingCar,
      car
    );

    /*
     * We keep carKey as a non-schema field
     * until the schema migration is applied.
     */

    existingCar.carKey = carKey;

    await existingCar.save();

    return {
      action: "updated",
      car: existingCar
    };
  }

  /*
   * New vehicle
   */

  const newCar =
    new Car({
      ...car,
      carKey
    });

  await newCar.save();

  return {
    action: "created",
    car: newCar
  };
}

/* =========================================================
   BULK IMPORT
========================================================= */

export async function importCars(cars) {
  if (!Array.isArray(cars)) {
    throw new Error(
      "Cars data must be an array."
    );
  }

  const results = {
    total: cars.length,
    created: 0,
    updated: 0,
    failed: 0,
    errors: []
  };

  for (
    let index = 0;
    index < cars.length;
    index++
  ) {
    try {
      const result =
        await upsertCar(
          cars[index]
        );

      if (
        result.action ===
        "created"
      ) {
        results.created++;
      }

      if (
        result.action ===
        "updated"
      ) {
        results.updated++;
      }

    } catch (error) {
      results.failed++;

      results.errors.push({
        index,
        brand:
          cars[index]?.brand || "",
        model:
          cars[index]?.model || "",
        message:
          error.message
      });
    }
  }

  return results;
}