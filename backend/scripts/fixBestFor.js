import "dotenv/config";
import mongoose from "mongoose";
import Car from "../models/car.js";


/* =========================================================
   HTML CLEANER
========================================================= */

function stripHtmlTags(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();
}


/* =========================================================
   MAIN
========================================================= */

async function main() {

  try {

    console.log("");
    console.log("🧹 AutoVerse bestFor Cleanup");
    console.log("────────────────────────────────");


    /* -----------------------------------------------------
       Check MongoDB URI
    ----------------------------------------------------- */

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }


    /* -----------------------------------------------------
       Connect MongoDB
    ----------------------------------------------------- */

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      `✅ MongoDB Connected: ${mongoose.connection.name}`
    );


    /* -----------------------------------------------------
       Find cars containing HTML in bestFor
    ----------------------------------------------------- */

    const cars = await Car.find({
      bestFor: {
        $elemMatch: {
          $regex: /<[^>]*>/,
          $options: "i"
        }
      }
    });


    console.log(
      `🔎 Cars requiring cleanup: ${cars.length}`
    );


    if (cars.length === 0) {

      console.log("");
      console.log(
        "✅ No HTML tags found in bestFor."
      );

      return;
    }


    /* -----------------------------------------------------
       Update only bestFor
    ----------------------------------------------------- */

    let updated = 0;

    for (const car of cars) {

      const originalBestFor = Array.isArray(
        car.bestFor
      )
        ? [...car.bestFor]
        : [];

      const cleanedBestFor =
        originalBestFor
          .map(stripHtmlTags)
          .filter(Boolean);


      car.bestFor = cleanedBestFor;

      await car.save();

      updated++;

      console.log(
        `✅ ${car.brand} ${car.model}`
      );

      console.log(
        `   Before: ${JSON.stringify(originalBestFor)}`
      );

      console.log(
        `   After : ${JSON.stringify(cleanedBestFor)}`
      );
    }


    /* -----------------------------------------------------
       Final report
    ----------------------------------------------------- */

    console.log("");
    console.log("================================");
    console.log("📊 CLEANUP COMPLETE");
    console.log("================================");

    console.log(
      `Found   : ${cars.length}`
    );

    console.log(
      `Updated : ${updated}`
    );

    console.log(
      "Fields  : bestFor ONLY"
    );

    console.log("");
    console.log(
      "✅ No other car fields were modified."
    );


  } catch (error) {

    console.error("");
    console.error(
      "❌ CLEANUP FAILED"
    );

    console.error(
      error.message
    );

    process.exitCode = 1;

  } finally {

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