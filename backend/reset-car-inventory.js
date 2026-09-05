import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load the project's backend/.env, regardless of the folder
// from which this script is launched.
const projectBackendEnv = path.resolve(__dirname, "..", "backend", ".env");
const localEnv = path.resolve(__dirname, ".env");
const envPath = process.env.MONGO_URI ? null : (dotenv.config({ path: projectBackendEnv }).error ? localEnv : projectBackendEnv);
if (envPath) dotenv.config({ path: envPath });

const CONFIRM = process.env.CONFIRM_CAR_RESET;
const MONGO_URI = process.env.MONGO_URI;

console.log("============================================");
console.log(" AutoVerse — CAR INVENTORY RESET");
console.log("============================================");
console.log("");

if (CONFIRM !== "DELETE_ALL_CARS") {
  console.error("❌ RESET NOT CONFIRMED.");
  console.error("");
  console.error("PowerShell:");
  console.error('  $env:CONFIRM_CAR_RESET="DELETE_ALL_CARS"');
  console.error("  node reset-car-inventory.js");
  console.error("");
  console.error("Command Prompt:");
  console.error("  set CONFIRM_CAR_RESET=DELETE_ALL_CARS");
  console.error("  node reset-car-inventory.js");
  process.exit(1);
}

if (!MONGO_URI) {
  console.error("❌ MONGO_URI was not found.");
  console.error("Make sure your project's backend/.env contains MONGO_URI=...");
  process.exit(1);
}

let connected = false;

try {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  connected = true;
  console.log("✅ MongoDB connected.");

  // The project exports mongoose.model("Car", carSchema), whose default
  // MongoDB collection is `cars`.
  const carsCollection = mongoose.connection.collection("cars");

  const before = await carsCollection.countDocuments();
  console.log(`🚗 Cars before reset: ${before}`);

  if (before === 0) {
    console.log("ℹ️  Car collection is already empty.");
  } else {
    console.log("🗑️  Deleting ALL car documents...");
    const result = await carsCollection.deleteMany({});
    console.log(`✅ Deleted: ${result.deletedCount} car documents.`);
  }

  const after = await carsCollection.countDocuments();
  console.log(`🚗 Cars after reset: ${after}`);

  if (after !== 0) {
    throw new Error("Reset verification failed: cars collection is not empty.");
  }

  console.log("");
  console.log("============================================");
  console.log("✅ RESET COMPLETED SUCCESSFULLY");
  console.log("============================================");
  console.log("Only the `cars` collection was modified.");
  console.log("Users/admins/other collections were NOT modified.");
} catch (error) {
  console.error("");
  console.error("❌ RESET FAILED");
  console.error(`Reason: ${error?.message || error}`);
  console.error("");
  if (String(error?.message || "").includes("querySrv") || String(error?.message || "").includes("ECONN")) {
    console.error("This looks like a MongoDB connection/DNS/network issue.");
    console.error("Check that MongoDB Atlas is reachable from your PC and that your IP is allowed in Atlas Network Access.");
  }
  process.exitCode = 1;
} finally {
  if (connected) await mongoose.disconnect();
}
