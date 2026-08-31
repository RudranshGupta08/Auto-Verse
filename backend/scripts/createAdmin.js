import "dotenv/config";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/user.js";


/* =========================================================
   CREATE ADMIN ACCOUNT
========================================================= */

async function createAdmin() {

  try {

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }

    if (!process.env.ADMIN_USERNAME) {
      throw new Error(
        "ADMIN_USERNAME is missing from .env"
      );
    }

    if (!process.env.ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_PASSWORD is missing from .env"
      );
    }


    /* =====================================================
       DATABASE
    ===================================================== */

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB connected"
    );


    const username =
      process.env.ADMIN_USERNAME.trim();

    const password =
      process.env.ADMIN_PASSWORD;

    if (username.length < 3 || username.length > 50) {
      throw new Error("ADMIN_USERNAME must be 3–50 characters.");
    }

    if (password.length < 8 || password.length > 72) {
      throw new Error("ADMIN_PASSWORD must be 8–72 characters.");
    }


    /* =====================================================
       CHECK EXISTING ACCOUNT
    ===================================================== */

    let user =
      await User.findOne({
        username
      });


    /* =====================================================
       EXISTING USER
    ===================================================== */

    if (user) {

      user.role = "admin";
      user.status = "active";

      /*
       * Only reset password if explicitly requested.
       */
      if (
        process.env.ADMIN_RESET_PASSWORD ===
        "true"
      ) {

        user.password =
          await bcrypt.hash(
            password,
            12
          );
      }

      await user.save();

      console.log("");
      console.log(
        "✅ Existing account promoted to ADMIN."
      );

      console.log(
        `   Username: ${username}`
      );

      return;
    }


    /* =====================================================
       CREATE NEW ADMIN
    ===================================================== */

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    user =
      new User({

        username,

        password:
          hashedPassword,

        role:
          "admin",

        status:
          "active"

      });

    await user.save();

    console.log("");
    console.log(
      "✅ Admin account created successfully."
    );

    console.log(
      `   Username: ${username}`
    );

  } catch (error) {

    console.error("");
    console.error(
      "❌ Failed to create admin:"
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

      console.log(
        "🔌 MongoDB connection closed."
      );
    }
  }
}


createAdmin();