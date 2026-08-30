import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_ISSUER = process.env.JWT_ISSUER || "autoverse-api";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "autoverse-client";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured in environment variables.");
}

/* =========================================================
   SIGNUP
========================================================= */

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required."
      });
    }

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        message: "Username must contain at least 3 characters."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters."
      });
    }

    const existingUser = await User.findOne({
      username: cleanUsername
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      username: cleanUsername,
      password: hashedPassword
    });

    await user.save();

    return res.status(201).json({
      message: "Signup successful"
    });

  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Unable to create account."
    });
  }
});


/* =========================================================
   LOGIN
========================================================= */

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required."
      });
    }

    const cleanUsername = username.trim();

    const user = await User.findOne({
      username: cleanUsername
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password."
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid username or password."
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
      }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to login."
    });
  }
});


export default router;
