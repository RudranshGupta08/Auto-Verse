import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(
  __dirname,
  "..",
  "data",
  "cars"
);


/* =========================================================
   HELPERS
========================================================= */

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function carKey(brand, model) {
  return `${slugify(brand)}-${slugify(model)}`;
}


function createCar(
  brand,
  model,
  {
    type = "SUV",
    bodyType = type,
    priceRange = "",
    fuelType = ["Petrol"],
    transmission = ["Manual", "Automatic"],
    seatingCapacity = 5,
    isEV = false,
    bestFor = [],
    description = "",
    features = [],
    images = []
  } = {}
) {

  const normalizedBrand = brand;

  const aiTags = [
    bodyType,
    ...bestFor,
    ...fuelType
  ].filter(Boolean);

  if (isEV) {
    aiTags.push("Electric", "EV");
  }

  const keywords = [
    normalizedBrand,
    model,
    `${normalizedBrand} ${model}`,
    type,
    bodyType,
    ...fuelType,
    ...transmission,
    ...bestFor,
    ...aiTags
  ].filter(Boolean);

  return {

    /* BASIC INFO */

    brand: normalizedBrand,

    model,

    carKey: carKey(
      normalizedBrand,
      model
    ),

    type,

    bodyType,


    /* PRICE */

    priceRange,

    minPrice: 0,

    maxPrice: 0,


    /* ENGINE */

    engineOptions: [],

    engineCapacity: "",

    power: "",

    torque: "",


    /* FUEL */

    fuelType,

    isEV,

    batteryCapacity: "",

    range: "",

    chargingTime: "",

    mileage: "",

    fuelEconomy: 0,


    /* TRANSMISSION */

    transmission,

    drivetrain: "",


    /* DIMENSIONS */

    seatingCapacity,

    bootSpace: "",

    groundClearance: "",

    wheelbase: "",


    /* SAFETY */

    rating: 3,

    ncapRating: "Not Rated",

    airbags: 0,

    adas: false,

    safetyFeatures: [],


    /* FEATURES */

    features,

    infotainment: "",

    connectedCarTech: false,

    sunroof: false,

    panoramicSunroof: false,

    ventilatedSeats: false,


    /* SMART INFO */

    bestFor,

    pros: [],

    cons: [],

    verdict: "",

    description,


    /* AI */

    aiTags: [
      ...new Set(aiTags)
    ],

    keywords: [
      ...new Set(keywords)
    ],


    /* IMAGES */

    images,


    /* VARIANTS */

    variants: [],


    /* MARKET */

    launchDate: "",

    status: "Active",


    /* SEO */

    slug: carKey(
      normalizedBrand,
      model
    )
  };
}


/* =========================================================
   INITIAL INDIA MARKET DATA
========================================================= */

const BRANDS = {

  audi: {
    name: "Audi",
    models: [
      ["Q3", "SUV"],
      ["Q5", "SUV"],
      ["Q7", "SUV"],
      ["Q8", "SUV"],
      ["A4", "Sedan"]
    ]
  },


  bmw: {
    name: "BMW",
    models: [
      ["2 Series Gran Coupe", "Sedan"],
      ["3 Series", "Sedan"],
      ["5 Series", "Sedan"],
      ["X1", "SUV"],
      ["X3", "SUV"]
    ]
  },


  byd: {
    name: "BYD",
    models: [
      ["Atto 3", "SUV"],
      ["Seal", "Sedan"],
      ["eMAX 7", "MUV"],
      ["Sealion 7", "SUV"]
    ]
  },


  citroen: {
    name: "Citroen",
    models: [
      ["C3 X", "Sedan"],
      ["Aircross X", "SUV"],
      ["Basalt X", "SUV"],
      ["C5 Aircross", "SUV"],
      ["e-C3 X", "SUV"]
    ]
  },


  honda: {
    name: "Honda",
    models: [
      ["Amaze", "Sedan"],
      ["City", "Sedan"],
      ["Elevate", "SUV"],
      ["ZR-V", "SUV"],
      ["Amaze 2nd Gen", "Sedan"]
    ]
  },


  hyundai: {
    name: "Hyundai",
    models: [
      ["Grand i10 Nios", "Hatchback"],
      ["Exter", "SUV"],
      ["i20", "Hatchback"],
      ["Verna", "Sedan"],
      ["Creta", "SUV"]
    ]
  },


  isuzu: {
    name: "Isuzu",
    models: [
      ["D-Max", "Pickup"],
      ["V-Cross", "Pickup"],
      ["Hi-Lander", "Pickup"],
      ["MU-X", "SUV"],
      ["D-Max S-CAB", "Pickup"]
    ]
  },


  jaguar: {
    name: "Jaguar",
    models: [
      ["F-Pace", "SUV"]
    ]
  },


  jeep: {
    name: "Jeep",
    models: [
      ["Compass", "SUV"],
      ["Meridian", "SUV"],
      ["Wrangler", "SUV"],
      ["Grand Cherokee", "SUV"]
    ]
  },


  kia: {
    name: "Kia",
    models: [
      ["Seltos", "SUV"],
      ["Sonet", "SUV"],
      ["Carens", "MUV"],
      ["Syros", "SUV"],
      ["Carens Clavis", "MUV"]
    ]
  },


  "land-rover": {
    name: "Land Rover",
    models: [
      ["Range Rover Evoque", "SUV"],
      ["Range Rover Velar", "SUV"],
      ["Range Rover Sport", "SUV"],
      ["Range Rover", "SUV"],
      ["Defender", "SUV"]
    ]
  },


  lexus: {
    name: "Lexus",
    models: [
      ["ES", "Sedan"],
      ["NX", "SUV"],
      ["RX", "SUV"],
      ["LX", "SUV"],
      ["LM", "MUV"]
    ]
  },


  mahindra: {
    name: "Mahindra",
    models: [
      ["Scorpio N", "SUV"],
      ["Thar", "SUV"],
      ["Thar ROXX", "SUV"],
      ["BE 6", "SUV"],
      ["XUV 3XO", "SUV"]
    ]
  },


  "mercedes-benz": {
    name: "Mercedes-Benz",
    models: [
      ["C-Class", "Sedan"],
      ["E-Class", "Sedan"],
      ["GLA", "SUV"],
      ["GLC", "SUV"],
      ["GLE", "SUV"]
    ]
  },


  mg: {
    name: "MG",
    models: [
      ["Hector", "SUV"],
      ["Hector Tomahawk EV", "SUV"],
      ["Windsor EV", "Hatchback"],
      ["Comet EV", "Hatchback"],
      ["Astor", "SUV"]
    ]
  },


  mini: {
    name: "MINI",
    models: [
      ["Cooper 3 Door", "Hatchback"],
      ["Cooper 5 Door", "Hatchback"],
      ["Cooper Convertible", "Convertible"],
      ["Countryman", "SUV"],
      ["Countryman Electric", "SUV"]
    ]
  },


  nissan: {
    name: "Nissan",
    models: [
      ["Magnite", "SUV"]
    ]
  },


  porsche: {
    name: "Porsche",
    models: [
      ["Cayenne", "SUV"],
      ["Macan", "SUV"],
      ["911", "Coupe"],
      ["Panamera", "Sedan"],
      ["Taycan", "Sedan"]
    ]
  },


  renault: {
    name: "Renault",
    models: [
      ["Kwid", "Hatchback"],
      ["Triber", "MUV"],
      ["Kiger", "SUV"]
    ]
  },


  skoda: {
    name: "Skoda",
    models: [
      ["Kylaq", "SUV"],
      ["Kushaq", "SUV"],
      ["Slavia", "Sedan"],
      ["Kodiaq", "SUV"],
      ["Octavia RS", "Sedan"]
    ]
  },


  tata: {
    name: "Tata",
    models: [
      ["Tiago", "Hatchback"],
      ["Punch", "SUV"],
      ["Nexon", "SUV"],
      ["Harrier", "SUV"],
      ["Sierra", "SUV"]
    ]
  },


  toyota: {
    name: "Toyota",
    models: [
      ["Glanza", "Hatchback"],
      ["Urban Cruiser Hyryder", "SUV"],
      ["Innova Hycross", "MUV"],
      ["Fortuner", "SUV"],
      ["Camry", "Sedan"]
    ]
  },


  volkswagen: {
    name: "Volkswagen",
    models: [
      ["Taigun", "SUV"],
      ["Virtus", "Sedan"],
      ["Tiguan", "SUV"],
      ["Golf GTI", "Hatchback"],
      ["ID.4", "SUV"]
    ]
  },


  volvo: {
    name: "Volvo",
    models: [
      ["EX30", "SUV"],
      ["EX40", "SUV"],
      ["XC40", "SUV"],
      ["XC60", "SUV"],
      ["XC90", "SUV"]
    ]
  }

};


/* =========================================================
   SPECIAL POWERTRAIN SETTINGS
========================================================= */

const EV_MODELS = new Set([

  "Atto 3",
  "Seal",
  "eMAX 7",
  "Sealion 7",

  "BE 6",

  "Hector Tomahawk EV",
  "Windsor EV",
  "Comet EV",

  "Countryman Electric",

  "Taycan",

  "EX30",
  "EX40",
  "ID.4"
]);


/* =========================================================
   GENERATE FILES
========================================================= */

async function main() {

  console.log("");
  console.log(
    "🚗 AutoVerse Initial India Car Dataset"
  );

  console.log(
    "────────────────────────────────"
  );

  let created = 0;
  let skipped = 0;
  let totalCars = 0;


  for (
    const [folder, brandData]
    of Object.entries(BRANDS)
  ) {

    const directory = path.join(
      DATA_DIR,
      folder
    );

    const filePath = path.join(
      directory,
      "cars.json"
    );


    await fs.mkdir(
      directory,
      {
        recursive: true
      }
    );


    /* ---------------------------------------------
       IMPORTANT:
       Never overwrite existing populated files.
    --------------------------------------------- */

    let existing = null;

    try {

      const raw =
        await fs.readFile(
          filePath,
          "utf8"
        );

      const cleaned =
        raw
          .replace(/^\uFEFF/, "")
          .trim();

      if (cleaned) {

        existing =
          JSON.parse(cleaned);
      }

    } catch {
      existing = null;
    }


    if (
      Array.isArray(existing) &&
      existing.length > 0
    ) {

      console.log(
        `⚠️ ${brandData.name}: existing data preserved (${existing.length} cars)`
      );

      skipped++;

      continue;
    }


    /* ---------------------------------------------
       Generate cars
    --------------------------------------------- */

    const cars =
      brandData.models.map(
        ([model, bodyType]) => {

          const isEV =
            EV_MODELS.has(model);

          return createCar(
            brandData.name,
            model,
            {
              type: bodyType,
              bodyType,
              isEV,
              fuelType:
                isEV
                  ? ["Electric"]
                  : ["Petrol"],
              bestFor:
                bodyType === "SUV"
                  ? ["Family", "SUV"]
                  : bodyType === "Sedan"
                    ? ["City", "Family"]
                    : ["City"]
            }
          );
        }
      );


    /* ---------------------------------------------
       Write JSON
    --------------------------------------------- */

    await fs.writeFile(
      filePath,
      JSON.stringify(
        cars,
        null,
        2
      ),
      "utf8"
    );


    console.log(
      `✅ ${brandData.name}: ${cars.length} cars`
    );

    created++;

    totalCars += cars.length;
  }


  console.log("");
  console.log(
    "────────────────────────────────"
  );

  console.log(
    `🚘 Cars generated : ${totalCars}`
  );

  console.log(
    `📁 Files created  : ${created}`
  );

  console.log(
    `⏭️ Files preserved : ${skipped}`
  );

  console.log(
    "────────────────────────────────"
  );

  console.log(
    "✅ Initial dataset generation complete."
  );

  console.log("");
}


main().catch(error => {

  console.error(
    "❌ Dataset generation failed:"
  );

  console.error(
    error.message
  );

  process.exit(1);
});