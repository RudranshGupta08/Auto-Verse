import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";

import { fileURLToPath } from "url";

import {
  importCars
} from "../services/carImportService.js";


/* =========================================================
   PATHS
========================================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDirectory = path.join(
  __dirname,
  "..",
  "data",
  "cars"
);


/* =========================================================
   JSON CLEANER
   Removes UTF-8 BOM and unnecessary whitespace
========================================================= */

function cleanJsonFile(content) {
  return content
    .replace(/^\uFEFF/, "")
    .trim();
}


/* =========================================================
   LOAD MANUFACTURER FILES
========================================================= */

async function loadManufacturerFiles() {

  const manufacturers = await fs.readdir(
    dataDirectory,
    {
      withFileTypes: true
    }
  );

  const allCars = [];

  for (const manufacturer of manufacturers) {

    /* ---------------------------------------------
       Ignore files and non-directories
    --------------------------------------------- */

    if (!manufacturer.isDirectory()) {
      continue;
    }

    const brandFolder = manufacturer.name;

    const filePath = path.join(
      dataDirectory,
      brandFolder,
      "cars.json"
    );


    /* ---------------------------------------------
       Check cars.json exists
    --------------------------------------------- */

    try {
      await fs.access(filePath);
    } catch {
      console.log(
        `⚠️ ${brandFolder}: cars.json not found`
      );

      continue;
    }


    /* ---------------------------------------------
       Read JSON
    --------------------------------------------- */

    try {

      const rawFile = await fs.readFile(
        filePath,
        "utf8"
      );

      const cleanedFile = cleanJsonFile(
        rawFile
      );


      /* -------------------------------------------
         Empty file
      ------------------------------------------- */

      if (!cleanedFile) {

        console.log(
          `⚠️ ${brandFolder}: cars.json is empty`
        );

        continue;
      }


      /* -------------------------------------------
         Parse JSON
      ------------------------------------------- */

      let parsed;

      try {

        parsed = JSON.parse(
          cleanedFile
        );

      } catch (error) {

        console.error(
          `❌ ${brandFolder}: Invalid JSON`
        );

        console.error(
          `   ${error.message}`
        );

        continue;
      }


      /* -------------------------------------------
         Support both formats

         1. [ {...}, {...} ]

         2. { cars: [...] }
      ------------------------------------------- */

      const cars = Array.isArray(parsed)
        ? parsed
        : parsed?.cars;


      /* -------------------------------------------
         Validate array
      ------------------------------------------- */

      if (!Array.isArray(cars)) {

        console.log(
          `⚠️ ${brandFolder}: JSON must contain an array`
        );

        continue;
      }


      /* -------------------------------------------
         Empty array
      ------------------------------------------- */

      if (cars.length === 0) {

        console.log(
          `⚠️ ${brandFolder}: cars.json is empty`
        );

        continue;
      }


      /* -------------------------------------------
         IMPORTANT:
         Validate brand folder vs car brand

         This prevents accidental mismatch.
      ------------------------------------------- */

      const validCars = [];

      for (const car of cars) {

        if (
          !car ||
          typeof car !== "object"
        ) {

          console.log(
            `⚠️ ${brandFolder}: Skipping invalid car object`
          );

          continue;
        }


        const carBrand = String(
          car.brand || ""
        )
          .trim()
          .toLowerCase();


        /*
         * Convert folder name into a comparable
         * normalized brand identifier.
         */

        const normalizedFolderBrand =
          brandFolder
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");


        const normalizedCarBrand =
          carBrand
            .replace(/[^a-z0-9]/g, "");


        /*
         * If brand exists and doesn't match
         * the folder, reject it.
         */

        if (
          normalizedCarBrand &&
          normalizedCarBrand !== normalizedFolderBrand
        ) {

          console.error(
            `❌ BRAND MISMATCH`
          );

          console.error(
            `   Folder : ${brandFolder}`
          );

          console.error(
            `   Car    : ${car.brand} ${car.model || ""}`
          );

          console.error(
            `   Skipped to prevent incorrect database entry.`
          );

          continue;
        }


        /*
         * Force the folder's canonical brand
         * when brand is missing.
         */

        if (!car.brand) {

          car.brand = brandFolder;
        }


        validCars.push(car);
      }


      /* -------------------------------------------
         No valid cars
      ------------------------------------------- */

      if (validCars.length === 0) {

        console.log(
          `⚠️ ${brandFolder}: No valid cars found`
        );

        continue;
      }


      /* -------------------------------------------
         Add cars to universal dataset
      ------------------------------------------- */

      console.log(
        `📦 ${brandFolder}: ${validCars.length} valid cars`
      );

      allCars.push(
        ...validCars
      );


    } catch (error) {

      console.error(
        `❌ ${brandFolder}: Failed to read cars.json`
      );

      console.error(
        `   ${error.message}`
      );

      continue;
    }
  }

  return allCars;
}


/* =========================================================
   MAIN IMPORT
========================================================= */

async function main() {

  try {

    console.log("");
    console.log(
      "🚗 AutoVerse Universal Data Hub"
    );

    console.log(
      "────────────────────────────────"
    );


    /* ---------------------------------------------
       MongoDB connection
    --------------------------------------------- */

    if (!process.env.MONGO_URI) {

      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      `✅ MongoDB Connected: ${
        mongoose.connection.name
      }`
    );

    console.log("");


    /* ---------------------------------------------
       Load all manufacturers
    --------------------------------------------- */

    const allCars =
      await loadManufacturerFiles();


    /* ---------------------------------------------
       Universal total
    --------------------------------------------- */

    console.log("");
    console.log(
      "────────────────────────────────"
    );

    console.log(
      `🚘 Total valid cars discovered: ${allCars.length}`
    );

    console.log(
      "────────────────────────────────"
    );


    /* ---------------------------------------------
       Nothing to import
    --------------------------------------------- */

    if (allCars.length === 0) {

      console.log("");
      console.log(
        "⚠️ No cars available for import."
      );

      console.log(
        "   Add cars to data/cars/<brand>/cars.json"
      );

      return;
    }


    /* ---------------------------------------------
       Import / Update database
    --------------------------------------------- */

    const results =
      await importCars(allCars);


    /* ---------------------------------------------
       Final report
    --------------------------------------------- */

    console.log("");
    console.log(
      "================================"
    );

    console.log(
      "📊 IMPORT COMPLETE"
    );

    console.log(
      "================================"
    );

    console.log(
      `Total   : ${results.total}`
    );

    console.log(
      `Created : ${results.created}`
    );

    console.log(
      `Updated : ${results.updated}`
    );

    console.log(
      `Failed  : ${results.failed}`
    );


    /* ---------------------------------------------
       Error report
    --------------------------------------------- */

    if (
      results.errors &&
      results.errors.length
    ) {

      console.log("");
      console.log(
        "❌ IMPORT ERRORS"
      );

      console.log(
        "────────────────────────────────"
      );

      results.errors.forEach(
        error => {

          console.log(
            `#${error.index + 1} ${
              error.brand
            } ${error.model}`
          );

          console.log(
            `   ${error.message}`
          );
        }
      );
    }


    /* ---------------------------------------------
       Success summary
    --------------------------------------------- */

    console.log("");

    if (results.failed === 0) {

      console.log(
        "✅ All valid cars imported successfully."
      );

    } else {

      console.log(
        "⚠️ Import completed with some failures."
      );
    }


  } catch (error) {

    console.error("");
    console.error(
      "❌ IMPORT PROCESS FAILED"
    );

    console.error(
      error.message
    );

    process.exitCode = 1;

  } finally {

    /* ---------------------------------------------
       Close MongoDB
    --------------------------------------------- */

    if (
      mongoose.connection.readyState !== 0
    ) {

      await mongoose.connection.close();

      console.log("");
      console.log(
        "🔌 MongoDB connection closed."
      );
    }
  }
}


/* =========================================================
   RUN
========================================================= */

main();