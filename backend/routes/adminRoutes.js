import express from "express";
import multer from "multer";

import Car from "../models/car.js";
import mongoose from "mongoose";

import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import csrfProtection from "../middleware/csrf.js";

import {
  normalizeCar,
  importCars
} from "../services/carImportService.js";

const router = express.Router();


/* =========================================================
   ADMIN AUTH
========================================================= */

router.use(auth, admin, csrfProtection);


/* =========================================================
   DASHBOARD
========================================================= */

router.get("/dashboard", async (req, res) => {

  try {

    const [
      totalCars,
      activeCars,
      archivedCars,
      draftCars,
      brandData,
      variantData,
      evCars
    ] = await Promise.all([

      Car.countDocuments(),

      Car.countDocuments({
        status: "Active"
      }),

      Car.countDocuments({
        status: "Archived"
      }),

      Car.countDocuments({
        status: "Draft"
      }),

      Car.aggregate([
        {
          $group: {
            _id: "$brand"
          }
        },

        {
          $count: "count"
        }
      ]),

      Car.aggregate([
        {
          $project: {
            count: {
              $size: {
                $ifNull: [
                  "$variants",
                  []
                ]
              }
            }
          }
        },

        {
          $group: {
            _id: null,
            total: {
              $sum: "$count"
            }
          }
        }
      ]),

      Car.countDocuments({
        isEV: true
      })

    ]);


    return res.json({

      success: true,

      statistics: {

        totalCars,

        activeCars,

        archivedCars,

        draftCars,

        totalBrands:
          brandData[0]?.count || 0,

        totalVariants:
          variantData[0]?.total || 0,

        evCars

      }

    });

  } catch (error) {

    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load dashboard."
    });
  }
});


/* =========================================================
   GET CARS
   Pagination + Search + Filters
========================================================= */

router.get("/cars", async (req, res) => {

  try {

    const requestedPage = Number(req.query.page);

    const page = Number.isInteger(requestedPage)
      ? Math.min(Math.max(requestedPage, 1), 10000)
      : 1;

    const requestedLimit = Number(req.query.limit);

    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;

    const skip =
      (page - 1) * limit;


    const {
      search,
      brand,
      type,
      status
    } = req.query;


    const filter = {};


    /* =====================================================
       SEARCH
    ===================================================== */

    if (typeof search === "string" && search.trim()) {

      const normalizedSearch = search.trim().slice(0, 100);

      const safeSearch =
        normalizedSearch
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

      const regex =
        new RegExp(
          safeSearch,
          "i"
        );

      filter.$or = [

        {
          brand: regex
        },

        {
          model: regex
        },

        {
          type: regex
        },

        {
          bodyType: regex
        },

        {
          carKey: regex
        }

      ];
    }


    /* =====================================================
       FILTERS
    ===================================================== */

    if (typeof brand === "string" && brand.trim()) {

      filter.brand =
        new RegExp(
          brand.trim().slice(0, 80)
            .replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            ),
          "i"
        );
    }


    if (typeof type === "string" && type.trim()) {

      filter.type =
        new RegExp(
          type.trim().slice(0, 80)
            .replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            ),
          "i"
        );
    }


    if (status?.trim()) {

      filter.status =
        status.trim();
    }


    const [
      cars,
      total
    ] = await Promise.all([

      Car.find(filter)
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Car.countDocuments(filter)

    ]);


    return res.json({

      success: true,

      data: cars,

      pagination: {

        page,

        limit,

        total,

        totalPages:
          Math.ceil(
            total / limit
          )

      }

    });

  } catch (error) {

    console.error(
      "Admin cars error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to load vehicles."

    });
  }
});


/* =========================================================
   ID VALIDATION
========================================================= */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeObjectIds(ids) {
  return ids
    .filter(id => typeof id === "string" && isValidObjectId(id))
    .map(id => new mongoose.Types.ObjectId(id));
}

/* =========================================================
   GET SINGLE CAR
========================================================= */

router.get("/cars/:id", async (req, res) => {

  try {

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID."
      });
    }

    const car =
      await Car.findById(
        req.params.id
      );

    if (!car) {

      return res.status(404).json({
        success: false,
        message:
          "Car not found."
      });
    }

    return res.json({
      success: true,
      data: car
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message:
        "Invalid vehicle ID."
    });
  }
});


/* =========================================================
   CREATE / UPDATE SINGLE CAR
========================================================= */

router.post("/cars", async (req, res) => {

  try {

    const car =
      normalizeCar(
        req.body
      );

    const existing =
      await Car.findOne({
        $or: [

          {
            carKey:
              car.slug
          },

          {
            brand:
              car.brand,

            model:
              car.model
          }

        ]
      });


    if (existing) {

      return res.status(409).json({

        success: false,

        message:
          "A vehicle with this brand and model already exists.",

        carId:
          existing._id

      });
    }


    const newCar =
      await Car.create({
        ...car,
        carKey: car.slug
      });


    return res.status(201).json({

      success: true,

      message:
        "Vehicle created successfully.",

      data:
        newCar

    });

  } catch (error) {

    console.error(
      "Create car error:",
      error
    );

    return res.status(400).json({

      success: false,

      message:
        error.message

    });
  }
});


/* =========================================================
   UPDATE SINGLE CAR
========================================================= */

router.put("/cars/:id", async (req, res) => {

  try {

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID."
      });
    }

    const existing =
      await Car.findById(
        req.params.id
      );

    if (!existing) {

      return res.status(404).json({

        success: false,

        message:
          "Vehicle not found."

      });
    }


    const normalized =
      normalizeCar(
        req.body
      );


    /*
     * Preserve the existing document identity.
     */

    existing.set({
      ...normalized,

      carKey:
        normalized.slug
    });


    await existing.save();


    return res.json({

      success: true,

      message:
        "Vehicle updated successfully.",

      data:
        existing

    });

  } catch (error) {

    console.error(
      "Update car error:",
      error
    );

    return res.status(400).json({

      success: false,

      message:
        error.message

    });
  }
});


/* =========================================================
   ARCHIVE CAR
========================================================= */

router.patch(
  "/cars/:id/archive",
  async (req, res) => {

    try {

      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid vehicle ID."
        });
      }

      const car =
        await Car.findById(
          req.params.id
        );

      if (!car) {

        return res.status(404).json({

          success: false,

          message:
            "Vehicle not found."

        });
      }


      car.status =
        "Archived";

      await car.save();


      return res.json({

        success: true,

        message:
          "Vehicle archived successfully.",

        data:
          car

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          "Unable to archive vehicle."

      });
    }
  }
);


/* =========================================================
   RESTORE CAR
========================================================= */

router.patch(
  "/cars/:id/restore",
  async (req, res) => {

    try {

      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid vehicle ID."
        });
      }

      const car =
        await Car.findById(
          req.params.id
        );

      if (!car) {

        return res.status(404).json({

          success: false,

          message:
            "Vehicle not found."

        });
      }


      car.status =
        "Active";

      await car.save();


      return res.json({

        success: true,

        message:
          "Vehicle restored successfully.",

        data:
          car

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          "Unable to restore vehicle."

      });
    }
  }
);


/* =========================================================
   BULK STATUS UPDATE
========================================================= */

router.patch(
  "/cars/bulk/status",
  async (req, res) => {

    try {

      const {
        ids,
        status
      } = req.body;


      if (
        !Array.isArray(ids) ||
        ids.length === 0 ||
        ids.length > 100
      ) {

        return res.status(400).json({

          success: false,

          message:
            "At least one vehicle ID is required."

        });
      }


      const allowedStatuses = [
        "Active",
        "Inactive",
        "Draft",
        "Archived",
        "Discontinued"
      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid vehicle status."

        });
      }


      const objectIds = normalizeObjectIds(ids);

      if (objectIds.length !== ids.length) {
        return res.status(400).json({
          success: false,
          message: "One or more vehicle IDs are invalid."
        });
      }

      const result =
        await Car.updateMany(

          {
            _id: {
              $in: objectIds
            }
          },

          {
            $set: {
              status
            }
          }

        );


      return res.json({

        success: true,

        message:
          `${result.modifiedCount} vehicle(s) updated.`,

        modifiedCount:
          result.modifiedCount

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          "Unable to update vehicles."

      });
    }
  }
);


/* =========================================================
   EXPORT ALL CARS
========================================================= */

router.get(
  "/cars-export",
  async (req, res) => {

    try {

      const cars =
        await Car.find({})
          .sort({
            brand: 1,
            model: 1
          })
          .lean();


      return res.json({

        success: true,

        exportedAt:
          new Date().toISOString(),

        count:
          cars.length,

        cars

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          "Unable to export vehicles."

      });
    }
  }
);


/* =========================================================
   BULK JSON UPLOAD
========================================================= */

const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        10 * 1024 * 1024
    },

    fileFilter:
      (req, file, cb) => {

        const originalName =
          String(file.originalname || "").toLowerCase();

        const valid =
          originalName.endsWith(".json") &&
          (file.mimetype === "application/json" ||
           file.mimetype === "text/json" ||
           file.mimetype === "application/octet-stream");

        if (!valid) {

          return cb(
            new Error(
              "Only JSON files are supported."
            )
          );
        }

        cb(null, true);
      }
  });


/* =========================================================
   BULK IMPORT PREVIEW
========================================================= */

router.post(
  "/import/preview",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Please upload a JSON file."

        });
      }


      const raw =
        req.file.buffer.toString(
          "utf8"
        )
        .replace(
          /^\uFEFF/,
          ""
        )
        .trim();


      if (!raw) {

        return res.status(400).json({

          success: false,

          message:
            "The uploaded JSON file is empty."

        });
      }


      let parsed;

      try {

        parsed =
          JSON.parse(raw);

      } catch (error) {

        return res.status(400).json({

          success: false,

          message:
            `Invalid JSON: ${error.message}`

        });
      }


      const cars =
        Array.isArray(parsed)
          ? parsed
          : parsed?.cars;


      if (!Array.isArray(cars)) {

        return res.status(400).json({

          success: false,

          message:
            "JSON must be an array or contain a 'cars' array."

        });
      }


      if (cars.length === 0 || cars.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Import datasets must contain between 1 and 500 vehicles."
        });
      }

      const preview = {

        total:
          cars.length,

        valid: 0,

        invalid: 0,

        newCars: 0,

        existingCars: 0,

        errors: []

      };


      for (
        let index = 0;
        index < cars.length;
        index++
      ) {

        try {

          const normalized =
            normalizeCar(
              cars[index]
            );


          const existing =
            await Car.findOne({

              $or: [

                {
                  carKey:
                    normalized.slug
                },

                {
                  brand:
                    normalized.brand,

                  model:
                    normalized.model
                }

              ]

            })
            .select("_id");


          preview.valid++;


          if (existing) {
            preview.existingCars++;
          } else {
            preview.newCars++;
          }

        } catch (error) {

          preview.invalid++;

          preview.errors.push({

            index:
              index + 1,

            brand:
              cars[index]?.brand || "",

            model:
              cars[index]?.model || "",

            message:
              error.message

          });

        }
      }


      /*
       * Store parsed data temporarily in memory for this
       * request lifecycle only is NOT safe for confirmation.
       *
       * Therefore this endpoint is preview-only.
       * The frontend will upload the file again during
       * confirmation.
       */

      return res.json({

        success: true,

        fileName:
          req.file.originalname,

        preview

      });

    } catch (error) {

      console.error(
        "Import preview error:",
        error
      );

      return res.status(400).json({

        success: false,

        message:
          error.message

      });
    }
  }
);


/* =========================================================
   BULK JSON IMPORT
========================================================= */

router.post(
  "/import",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Please upload a JSON file."

        });
      }


      const raw =
        req.file.buffer.toString(
          "utf8"
        )
        .replace(
          /^\uFEFF/,
          ""
        )
        .trim();


      let parsed;

      try {

        parsed =
          JSON.parse(raw);

      } catch (error) {

        return res.status(400).json({

          success: false,

          message:
            `Invalid JSON: ${error.message}`

        });
      }


      const cars =
        Array.isArray(parsed)
          ? parsed
          : parsed?.cars;


      if (!Array.isArray(cars)) {

        return res.status(400).json({

          success: false,

          message:
            "JSON must be an array or contain a 'cars' array."

        });
      }


      if (cars.length === 0 || cars.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Import datasets must contain between 1 and 500 vehicles."
        });
      }

      const results =
        await importCars(
          cars
        );


      return res.json({

        success:
          results.failed === 0,

        message:
          "Bulk import completed.",

        results

      });

    } catch (error) {

      console.error(
        "Bulk import error:",
        error
      );

      return res.status(400).json({

        success: false,

        message:
          error.message

      });
    }
  }
);


export default router;