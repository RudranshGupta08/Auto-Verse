/**
 * Auto-Verse — One-time MongoDB image path migration
 *
 * PURPOSE:
 *   Repair MongoDB car.image paths so they match:
 *     backend/public/images/<vehicle-folder>/<filename>
 *
 * SAFE DEFAULT:
 *   DRY_RUN=true
 *
 * WRITE MODE:
 *   Windows PowerShell:
 *     $env:DRY_RUN="false"
 *     $env:CONFIRM_IMAGE_PATH_FIX="FIX_IMAGE_PATHS"
 *     node fixImagePaths.cjs
 *
 * Or simply:
 *     node fixImagePaths.cjs
 *   which performs a dry run and makes NO database changes.
 *
 * IMPORTANT:
 *   This script modifies ONLY the `images` array on Car documents.
 *   It does not delete cars, users, admins, or image files.
 */

"use strict";

require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");


const DRY_RUN = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
const CONFIRM = process.env.CONFIRM_IMAGE_PATH_FIX || "";

const IMAGE_ROOT = path.join(__dirname, "public", "images");

const SPECIAL_FOLDERS = {
  "victoris": "victorious",
  "victoris ": "victorious",
  "grand vitara": "grand-vitara",
  "grand-vitara": "grand-vitara",
  "s-presso": "s-presso",
  "s presso": "s-presso",
  "e vitara": "e-vitara",
  "e-vitarа": "e-vitara",
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getVehicleFolder(car) {
  const model = String(car.model || "").trim().toLowerCase();

  if (SPECIAL_FOLDERS[model]) {
    return SPECIAL_FOLDERS[model];
  }

  const slug = slugify(car.model);

  // Project-specific folder names confirmed from the current image tree.
  const known = {
    "grand-vitara": "grand-vitara",
    "victoris": "victorious",
    "s-presso": "s-presso",
    "e-vitara": "e-vitara",
  };

  return known[slug] || slug;
}

function cleanImagePath(value) {
  if (!value) return "";

  const raw = String(value).trim().replace(/\\/g, "/");

  // Never rewrite external image URLs.
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return raw.replace(/^\/+/, "");
}

function isLikelyFolderPath(value) {
  return value.includes("/");
}

function buildCandidate(car, imagePath) {
  const cleaned = cleanImagePath(imagePath);
  if (!cleaned || /^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  const folder = getVehicleFolder(car);

  // Already correctly folder-qualified.
  if (cleaned.startsWith(`${folder}/`)) {
    return cleaned;
  }

  // If the stored path has another/wrong folder, use its filename
  // under the car's actual project folder.
  const filename = path.posix.basename(cleaned);
  return `${folder}/${filename}`;
}

function resolveExistingLocalPath(candidate) {
  if (!candidate || /^https?:\/\//i.test(candidate)) return null;

  const full = path.join(IMAGE_ROOT, candidate);

  // Prevent accidental path traversal.
  const root = path.resolve(IMAGE_ROOT) + path.sep;
  const resolved = path.resolve(full);
  if (!resolved.startsWith(root)) return null;

  return fs.existsSync(resolved) ? resolved : null;
}

function findSameBasenameInVehicleFolder(car, candidate) {
  if (!candidate || /^https?:\/\//i.test(candidate)) return null;

  const folder = getVehicleFolder(car);
  const filename = path.posix.basename(candidate);
  const folderPath = path.join(IMAGE_ROOT, folder);

  if (!fs.existsSync(folderPath)) return null;

  const match = fs.readdirSync(folderPath, { withFileTypes: true })
    .find(entry =>
      entry.isFile() &&
      entry.name.toLowerCase() === filename.toLowerCase()
    );

  return match ? `${folder}/${match.name}` : null;
}

function normalizeCarImages(car) {
  const source = Array.isArray(car.images) ? car.images : [];
  const output = [];
  const seen = new Set();

  for (const original of source) {
    const candidate = buildCandidate(car, original);
    if (!candidate) continue;

    let finalPath = candidate;

    // For local paths, prefer the exact file if it exists.
    if (!/^https?:\/\//i.test(finalPath)) {
      const exact = resolveExistingLocalPath(finalPath);

      // If exact path is absent, try to find the same basename inside
      // the vehicle's confirmed folder. This handles filename/casing
      // differences without inventing a filename.
      if (!exact) {
        const basenameMatch = findSameBasenameInVehicleFolder(car, finalPath);
        if (basenameMatch) {
          finalPath = basenameMatch;
        }
      }
    }

    if (!seen.has(finalPath)) {
      seen.add(finalPath);
      output.push(finalPath);
    }
  }

  return output;
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from backend/.env or environment variables.");
  }

  console.log("==============================================");
  console.log(" Auto-Verse Image Path Migration");
  console.log("==============================================");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no database writes)" : "WRITE MODE"}`);
  console.log(`Image root: ${IMAGE_ROOT}`);
  console.log("");

  if (!DRY_RUN && CONFIRM !== "FIX_IMAGE_PATHS") {
    throw new Error(
      'Write mode requires CONFIRM_IMAGE_PATH_FIX="FIX_IMAGE_PATHS".'
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected.\n");

  // Auto-Verse uses ES modules ("type": "module"), so load the Mongoose
  // model with a dynamic import from this CommonJS migration script.
  const carModule = await import("./models/car.js");
  const Car = carModule.default;

  if (!Car || typeof Car.find !== "function") {
    throw new Error("Could not load the Car Mongoose model from ./models/car.js");
  }

  const cars = await Car.find({}).lean();

  let changed = 0;
  let unchanged = 0;
  let missingLocalFiles = 0;

  for (const car of cars) {
    const before = Array.isArray(car.images) ? car.images : [];
    const after = normalizeCarImages(car);

    // Report missing local files, but do not delete or invent paths.
    for (const item of after) {
      if (!/^https?:\/\//i.test(item) && !resolveExistingLocalPath(item)) {
        missingLocalFiles++;
      }
    }

    if (arraysEqual(before, after)) {
      unchanged++;
      continue;
    }

    changed++;

    console.log(`CAR: ${car.brand || ""} ${car.model || ""}`);
    console.log(`ID : ${car._id}`);
    console.log("BEFORE:");
    for (const item of before) console.log(`  - ${item}`);
    console.log("AFTER:");
    for (const item of after) console.log(`  + ${item}`);
    console.log("");

    if (!DRY_RUN) {
      await Car.updateOne(
        { _id: car._id },
        { $set: { images: after } }
      );
    }
  }

  console.log("==============================================");
  console.log("Migration summary");
  console.log("==============================================");
  console.log(`Cars checked          : ${cars.length}`);
  console.log(`Cars needing changes  : ${changed}`);
  console.log(`Cars unchanged        : ${unchanged}`);
  console.log(`Missing local files   : ${missingLocalFiles}`);
  console.log(`Database writes       : ${DRY_RUN ? 0 : changed}`);
  console.log("");

  if (DRY_RUN) {
    console.log("DRY RUN COMPLETE — nothing was changed.");
    console.log("");
    console.log("If the BEFORE/AFTER paths look correct, run:");
    console.log('  $env:DRY_RUN="false"');
    console.log('  $env:CONFIRM_IMAGE_PATH_FIX="FIX_IMAGE_PATHS"');
    console.log("  node fixImagePaths.cjs");
  } else {
    console.log("WRITE MIGRATION COMPLETE.");
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("\nMigration failed:");
  console.error(error.message || error);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
