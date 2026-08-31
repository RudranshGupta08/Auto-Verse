import "dotenv/config";

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.js";

import auth from "../middleware/auth.js";

import {
  issueCsrfToken,
  clearCsrfCookie
} from "../middleware/csrf.js";

const router = express.Router();

/* =========================================================
   CONFIG
========================================================= */

const JWT_SECRET =
  process.env.JWT_SECRET;

const JWT_ISSUER =
  process.env.JWT_ISSUER ||
  "autoverse-api";

const JWT_AUDIENCE =
  process.env.JWT_AUDIENCE ||
  "autoverse-client";

const COOKIE_NAME =
  process.env.COOKIE_NAME ||
  "autoverse_session";

const IS_PRODUCTION =
  process.env.NODE_ENV === "production";

if (
  !JWT_SECRET ||
  JWT_SECRET.length < 32
) {
  throw new Error(
    "JWT_SECRET must be configured with at least 32 characters."
  );
}

/* =========================================================
   SESSION COOKIE
========================================================= */

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,

  secure:
    IS_PRODUCTION,

  sameSite:
    IS_PRODUCTION
      ? "none"
      : "lax",

  path: "/",

  maxAge:
    2 * 60 * 60 * 1000
};

/* =========================================================
   CSRF
========================================================= */

router.get(
  "/csrf",
  (req, res) => {

    const token =
      issueCsrfToken(res);

    return res.status(200).json({
      success: true,
      csrfToken: token
    });

  }
);

/* =========================================================
   SIGNUP
========================================================= */

router.post(
  "/signup",
  async (req, res) => {

    try {

      const username =
        String(
          req.body?.username || ""
        ).trim();

      const password =
        String(
          req.body?.password || ""
        );

      if (
        username.length < 3
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Username must contain at least 3 characters."
        });

      }

      if (
        password.length < 6
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters."
        });

      }

      const existingUser =
        await User.findOne({
          username
        });

      if (existingUser) {

        return res.status(409).json({
          success: false,
          message:
            "Username is already registered."
        });

      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );

      const user =
        new User({
          username,
          password: hashedPassword,
          role: "user",
          status: "active",
          authVersion: 0
        });

      await user.save();

      return res.status(201).json({
        success: true,
        message:
          "Account created successfully. Please sign in."
      });

    } catch (error) {

      console.error(
        "Signup error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create account."
      });

    }

  }
);

/* =========================================================
   LOGIN
========================================================= */

router.post(
  "/login",
  async (req, res) => {

    try {

      const username =
        String(
          req.body?.username || ""
        ).trim();

      const password =
        String(
          req.body?.password || ""
        );

      if (
        !username ||
        !password
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Username and password are required."
        });

      }

      /*
       * password has select:false in the schema,
       * therefore explicitly request it.
       */

      const user =
        await User.findOne({
          username
        }).select("+password");

      if (!user) {

        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password."
        });

      }

      /*
       * Make absolutely sure a password hash exists
       * before bcrypt.compare().
       */

      if (
        !user.password ||
        typeof user.password !== "string"
      ) {

        console.error(
          "Login failed: user has no password hash.",
          username
        );

        return res.status(500).json({
          success: false,
          message:
            "Account authentication data is unavailable."
        });

      }

      const passwordValid =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordValid) {

        return res.status(401).json({
          success: false,
          message:
            "Invalid username or password."
        });

      }

      /*
       * Account status.
       */

      const accountStatus =
        String(
          user.status || "active"
        ).toLowerCase();

      if (
        accountStatus !== "active"
      ) {

        return res.status(403).json({
          success: false,
          message:
            "Account is not active."
        });

      }

      /*
       * Authentication version.
       */

      const authVersion =
        Number(
          user.authVersion ?? 0
        );

      /*
       * Normalize role.
       */

      const role =
        String(
          user.role || "user"
        ).toLowerCase();

      /*
       * Create JWT.
       */

      const token =
        jwt.sign(
          {
            id:
              user._id.toString(),

            type:
              "access",

            v:
              authVersion
          },

          JWT_SECRET,

          {
            expiresIn:
              process.env.JWT_EXPIRES_IN ||
              "2h",

            issuer:
              JWT_ISSUER,

            audience:
              JWT_AUDIENCE,

            algorithm:
              "HS256"
          }
        );

      /*
       * Update last login.
       */

      user.lastLoginAt =
        new Date();

      user.failedLoginAttempts =
        0;

      user.lockedUntil =
        null;

      await user.save();

      /*
       * IMPORTANT:
       *
       * JWT is stored ONLY in HttpOnly cookie.
       *
       * Do NOT return token to frontend.
       */

      res.cookie(
        COOKIE_NAME,
        token,
        SESSION_COOKIE_OPTIONS
      );

      return res.status(200).json({

        success: true,

        user: {
          id:
            user._id.toString(),

          username:
            user.username,

          role
        }

      });

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to complete authentication."
      });

    }

  }
);

/* =========================================================
   CURRENT USER
   GET /api/auth/me
========================================================= */

router.get(
  "/me",
  auth,
  async (req, res) => {

    return res.status(200).json({

      success: true,

      user: {
        id:
          req.user.id,

        username:
          req.user.username,

        role:
          String(
            req.user.role || "user"
          ).toLowerCase()
      }

    });

  }
);

/* =========================================================
   LOGOUT
========================================================= */

router.post(
  "/logout",
  async (req, res) => {

    try {

      /*
       * Clear JWT cookie.
       */

      res.clearCookie(
        COOKIE_NAME,
        {
          httpOnly: true,
          secure: IS_PRODUCTION,
          sameSite:
            IS_PRODUCTION
              ? "none"
              : "lax",
          path: "/"
        }
      );

      /*
       * Clear CSRF cookie.
       */

      clearCsrfCookie(res);

      return res.status(200).json({
        success: true,
        message:
          "Logged out successfully."
      });

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to logout."
      });

    }

  }
);

export default router;