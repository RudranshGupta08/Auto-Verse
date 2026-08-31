import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import Car from "../models/car.js";
import User from "../models/user.js";

import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

/* =========================================================
   MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    try {

      const model =
        req.body.model ||
        "unknown";

      const folderName =
        model
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "");

      const dir =
        path.join(
          "images",
          folderName
        );

      if (!fs.existsSync(dir)) {

        fs.mkdirSync(
          dir,
          {
            recursive: true
          }
        );

      }

      cb(null, dir);

    } catch (error) {

      cb(error);

    }

  },


  filename: (req, file, cb) => {

    const safeName =
      file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    cb(
      null,
      `${Date.now()}-${safeName}`
    );

  }

});


const upload =
  multer({
    storage
  });


/* =========================================================
   WISHLIST
   IMPORTANT: KEEP ABOVE /:id
========================================================= */


/* ---------------------------------------------------------
   ADD TO WISHLIST
--------------------------------------------------------- */

router.post(
  "/wishlist/:id",
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found."
        });

      }


      if (
        !user.wishlist.includes(
          req.params.id
        )
      ) {

        user.wishlist.push(
          req.params.id
        );

        await user.save();

      }


      res.json({
        success: true,
        message:
          "Added to wishlist"
      });

    } catch (error) {

      console.error(
        "Add wishlist error:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


/* ---------------------------------------------------------
   GET MY WISHLIST
--------------------------------------------------------- */

router.get(
  "/wishlist/me",
  auth,
  async (req, res) => {

    try {

      const user =
        await User
          .findById(req.user.id)
          .populate("wishlist");

      if (!user) {

        return res.status(404).json({
          message:
            "User not found."
        });

      }


      res.json(
        user.wishlist
      );

    } catch (error) {

      console.error(
        "Get wishlist error:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


/* ---------------------------------------------------------
   REMOVE FROM WISHLIST
--------------------------------------------------------- */

router.delete(
  "/wishlist/:id",
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found."
        });

      }


      user.wishlist =
        user.wishlist.filter(
          carId =>
            carId.toString() !==
            req.params.id
        );


      await user.save();


      res.json({
        success: true,
        message:
          "Removed from wishlist"
      });

    } catch (error) {

      console.error(
        "Remove wishlist error:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


/* =========================================================
   SEARCH
   IMPORTANT: KEEP ABOVE /:id
========================================================= */

router.get(
  "/search/:query",
  async (req, res) => {

    try {

      const query =
        req.params.query
          .toLowerCase()
          .trim();


      /* ---------------------------------------------------
         BUDGET SEARCH
         Example:
         /api/cars/search/under-10-lakh
         /api/cars/search/under 10 lakh
      --------------------------------------------------- */

      const budgetMatch =
        query.match(
          /under[-\s]?(\d+(?:\.\d+)?)\s?lakh/
        );


      if (budgetMatch) {

        const budget =
          parseFloat(
            budgetMatch[1]
          ) * 100000;


        const allCars =
          await Car.find();


        const filteredCars =
          allCars.filter(car => {

            /* ---------------------------------------------
               Prefer minPrice when available
            --------------------------------------------- */

            if (
              typeof car.minPrice ===
                "number" &&
              car.minPrice > 0
            ) {

              return (
                car.minPrice <=
                budget
              );

            }


            /* ---------------------------------------------
               Fallback to priceRange
            --------------------------------------------- */

            if (!car.priceRange) {

              return false;

            }


            const numbers =
              car.priceRange.match(
                /\d+(?:\.\d+)?/g
              );


            if (!numbers) {

              return false;

            }


            const minPrice =
              parseFloat(
                numbers[0]
              ) * 100000;


            return (
              minPrice <=
              budget
            );

          });


        if (
          !filteredCars.length
        ) {

          return res.json({
            found: false,
            cars: []
          });

        }


        filteredCars.sort(
          (a, b) =>
            (b.rating || 0) -
            (a.rating || 0)
        );


        return res.json({
          found: true,
          cars:
            filteredCars
        });

      }


      /* ---------------------------------------------------
         NORMAL SEARCH
      --------------------------------------------------- */

      const words =
        query
          .split(" ")
          .filter(
            word =>
              word.length
          );


      if (!words.length) {

        return res.json({
          found: false,
          cars: []
        });

      }


      const searchConditions =
        words.map(word => ({

          $or: [

            {
              brand:
                new RegExp(
                  word,
                  "i"
                )
            },

            {
              model:
                new RegExp(
                  word,
                  "i"
                )
            },

            {
              type:
                new RegExp(
                  word,
                  "i"
                )
            },

            {
              bodyType:
                new RegExp(
                  word,
                  "i"
                )
            },

            {
              fuelType: {
                $elemMatch: {
                  $regex: word,
                  $options: "i"
                }
              }
            },

            {
              transmission: {
                $elemMatch: {
                  $regex: word,
                  $options: "i"
                }
              }
            },

            {
              aiTags: {
                $elemMatch: {
                  $regex: word,
                  $options: "i"
                }
              }
            },

            {
              keywords: {
                $elemMatch: {
                  $regex: word,
                  $options: "i"
                }
              }
            }

          ]

        }));


      const cars =
        await Car.find({
          $and:
            searchConditions
        });


      if (!cars.length) {

        return res.json({
          found: false,
          cars: []
        });

      }


      res.json({
        found: true,
        cars
      });


    } catch (error) {

      console.error(
        "Car search error:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


/* =========================================================
   GET ALL CARS
========================================================= */

router.get(
  "/",
  async (req, res) => {

    try {

      const {
        brand,
        type,
        bodyType,
        status
      } = req.query;


      const filter = {};


      if (brand) {

        filter.brand =
          new RegExp(
            brand,
            "i"
          );

      }


      if (type) {

        filter.type =
          new RegExp(
            type,
            "i"
          );

      }


      if (bodyType) {

        filter.bodyType =
          new RegExp(
            bodyType,
            "i"
          );

      }


      if (status) {

        filter.status =
          new RegExp(
            status,
            "i"
          );

      }


      const cars =
        await Car.find(
          filter
        ).sort({
          createdAt: -1
        });


      res.json(cars);


    } catch (error) {

      console.error(
        "Get cars error:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


/* =========================================================
   GET SINGLE CAR
   IMPORTANT: KEEP LAST
========================================================= */

router.get(
  "/:id",
  async (req, res) => {

    try {

      const car =
        await Car.findById(
          req.params.id
        );


      if (!car) {

        return res.status(404).json({
          message:
            "Car not found"
        });

      }


      res.json(car);


    } catch (error) {

      console.error(
        "Get car error:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


/* =========================================================
   ADMIN — ADD CAR
========================================================= */

router.post(
  "/",
  admin,
  upload.array(
    "images",
    20
  ),
  async (req, res) => {

    try {

      /* ---------------------------------------------------
         REQUIRED FIELDS
      --------------------------------------------------- */

      if (
        !req.body.brand ||
        !req.body.model
      ) {

        return res.status(400).json({
          message:
            "Brand and model are required."
        });

      }


      const brand =
        req.body.brand
          .trim();


      const model =
        req.body.model
          .trim();


      const folderName =
        model
          .toLowerCase()
          .replace(
            /\s+/g,
            ""
          );


      const imagePaths =
        (req.files || []).map(
          file =>
            `${folderName}/${file.filename}`
        );


      /* ---------------------------------------------------
         CREATE CAR
      --------------------------------------------------- */

      const newCar =
        new Car({

          brand,

          model,

          type:
            req.body.type
              ?.trim()
              .toLowerCase() ||
            "",

          bodyType:
            req.body.bodyType
              ?.trim() ||
            "",


          /* PRICE */

          priceRange:
            req.body.priceRange ||
            "",

          minPrice:
            Number(
              req.body.minPrice
            ) || 0,

          maxPrice:
            Number(
              req.body.maxPrice
            ) || 0,


          /* ENGINE */

          engineOptions:
            req.body.engineOptions
              ? req.body.engineOptions
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          engineCapacity:
            req.body.engineCapacity ||
            "",

          power:
            req.body.power ||
            "",

          torque:
            req.body.torque ||
            "",


          /* FUEL */

          fuelType:
            req.body.fuelType
              ? req.body.fuelType
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          isEV:
            req.body.isEV === "true",

          batteryCapacity:
            req.body.batteryCapacity ||
            "",

          range:
            req.body.range ||
            "",

          chargingTime:
            req.body.chargingTime ||
            "",

          mileage:
            req.body.mileage ||
            "",

          fuelEconomy:
            Number(
              req.body.fuelEconomy
            ) || 0,


          /* TRANSMISSION */

          transmission:
            req.body.transmission
              ? req.body.transmission
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          drivetrain:
            req.body.drivetrain ||
            "",


          /* DIMENSIONS */

          seatingCapacity:
            Number(
              req.body.seatingCapacity
            ) || 5,

          bootSpace:
            req.body.bootSpace ||
            "",

          groundClearance:
            req.body.groundClearance ||
            "",

          wheelbase:
            req.body.wheelbase ||
            "",


          /* SAFETY */

          rating:
            Number(
              req.body.rating
            ) || 3,

          ncapRating:
            req.body.ncapRating ||
            "Not Rated",

          airbags:
            Number(
              req.body.airbags
            ) || 0,

          adas:
            req.body.adas === "true",

          safetyFeatures:
            req.body.safetyFeatures
              ? req.body.safetyFeatures
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],


          /* FEATURES */

          features:
            req.body.features
              ? req.body.features
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          infotainment:
            req.body.infotainment ||
            "",

          connectedCarTech:
            req.body.connectedCarTech ===
            "true",

          sunroof:
            req.body.sunroof ===
            "true",

          panoramicSunroof:
            req.body.panoramicSunroof ===
            "true",

          ventilatedSeats:
            req.body.ventilatedSeats ===
            "true",


          /* SMART INFO */

          bestFor:
            req.body.bestFor
              ? req.body.bestFor
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          pros:
            req.body.pros
              ? req.body.pros
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          cons:
            req.body.cons
              ? req.body.cons
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          verdict:
            req.body.verdict
              ?.trim() ||
            "",

          description:
            req.body.description ||
            "",


          /* AI */

          aiTags:
            req.body.aiTags
              ? req.body.aiTags
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          keywords:
            req.body.keywords
              ? req.body.keywords
                  .split(",")
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],


          /* IMAGES */

          images:
            imagePaths,


          /* MARKET */

          launchDate:
            req.body.launchDate ||
            "",

          status:
            req.body.status ||
            "Active"

        });


      /* ---------------------------------------------------
         SAVE
      --------------------------------------------------- */

      await newCar.save();


      res.status(201).json({

        success: true,

        message:
          "🚗 Car Added Successfully",

        car:
          newCar

      });


    } catch (error) {

      console.error(
        "Add car error:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


/* =========================================================
   ADMIN — DELETE CAR
========================================================= */

router.delete(
  "/:id",
  admin,
  async (req, res) => {

    try {

      const car =
        await Car.findById(
          req.params.id
        );


      if (!car) {

        return res.status(404).json({
          message:
            "Car not found"
        });

      }


      /* ---------------------------------------------------
         DELETE DATABASE RECORD
      --------------------------------------------------- */

      await Car.findByIdAndDelete(
        req.params.id
      );


      res.json({

        success: true,

        message:
          "❌ Car Deleted"

      });


    } catch (error) {

      console.error(
        "Delete car error:",
        error
      );

      res.status(500).json({
        message:
          error.message
      });

    }

  }
);


/* =========================================================
   EXPORT ROUTER
   ALWAYS KEEP THIS LAST
========================================================= */

export default router;