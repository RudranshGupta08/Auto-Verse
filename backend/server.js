import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// =========================================================
// ROUTES
// =========================================================

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// =========================================================
// APP
// =========================================================

const app = express();

app.disable("x-powered-by");

// =========================================================
// CONFIG
// =========================================================

const PORT = Number(process.env.PORT) || 5000;

const IS_PRODUCTION =
  process.env.NODE_ENV === "production";

/*
 * FRONTEND_URL can contain multiple comma-separated origins.
 *
 * Example:
 *
 * FRONTEND_URL=https://auto-verse-one.vercel.app,http://localhost:5500,http://127.0.0.1:5500
 */

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://127.0.0.1:5500,http://localhost:5500";

// API prefix

const API_PREFIX = "/api";

// =========================================================
// PATHS
// =========================================================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// =========================================================
// ORIGIN NORMALIZATION
// =========================================================

function normalizeOrigin(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

// =========================================================
// ALLOWED ORIGINS
// =========================================================

const configuredOrigins = FRONTEND_URL
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

/*
 * Always allow local development origins.
 *
 * IMPORTANT:
 * localhost and 127.0.0.1 are different origins.
 */

const localDevelopmentOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5501",
  "http://127.0.0.1:5501"
];

/*
 * Remove duplicates.
 */

const allowedOrigins = [
  ...new Set([
    ...configuredOrigins,
    ...localDevelopmentOrigins
  ])
];

// =========================================================
// STARTUP CONFIG LOGGING
// =========================================================

console.log("========================================");
console.log("🚗 AUTOVERSE BACKEND");
console.log("========================================");

console.log(
  "🌍 Environment:",
  process.env.NODE_ENV || "development"
);

console.log(
  "🔐 Production:",
  IS_PRODUCTION
);

console.log(
  "🌐 Allowed origins:",
  allowedOrigins
);

console.log(
  "🔗 API prefix:",
  API_PREFIX
);

console.log("========================================");

// =========================================================
// TRUST PROXY
// =========================================================

if (IS_PRODUCTION) {
  /*
   * Render sits behind a reverse proxy.
   *
   * This is required for:
   * - secure cookies
   * - rate limiting
   * - correct HTTPS detection
   */

  app.set("trust proxy", 1);
}

// =========================================================
// SECURITY HEADERS
// =========================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    },

    strictTransportSecurity: IS_PRODUCTION
      ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
      : false
  })
);

// =========================================================
// NO-CACHE FOR SECURITY ROUTES
// =========================================================

app.use((req, res, next) => {
  const requestPath = req.path || "";

  const isSensitiveRoute =
    requestPath === API_PREFIX ||
    requestPath.startsWith(`${API_PREFIX}/auth`) ||
    requestPath.startsWith(`${API_PREFIX}/admin`);

  if (isSensitiveRoute) {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    res.setHeader(
      "Pragma",
      "no-cache"
    );

    res.setHeader(
      "Expires",
      "0"
    );
  }

  next();
});

// =========================================================
// CORS
// =========================================================

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Requests without Origin:
       * - curl
       * - Postman
       * - server-to-server
       *
       * are allowed.
       */

      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin =
        normalizeOrigin(origin);

      /*
       * Exact origin match.
       */

      if (
        allowedOrigins.includes(
          normalizedOrigin
        )
      ) {
        return callback(null, true);
      }

      console.error(
        `❌ CORS blocked origin: ${normalizedOrigin}`
      );

      console.error(
        "Allowed origins:",
        allowedOrigins
      );

      return callback(
        new Error("CORS origin denied.")
      );
    },

    /*
     * Required because AutoVerse authentication
     * uses HttpOnly cookies.
     */

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-CSRF-Token"
    ],

    exposedHeaders: [
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset"
    ],

    optionsSuccessStatus: 204
  })
);

// =========================================================
// BODY PARSERS
// =========================================================

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "100kb"
  })
);

// =========================================================
// COOKIE PARSER
// =========================================================

app.use(cookieParser());

// =========================================================
// GLOBAL RATE LIMIT
// =========================================================

const globalLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 300,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again later."
    }
  });

app.use(globalLimiter);

// =========================================================
// AUTH RATE LIMIT
// =========================================================

const authLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 30,

    skipSuccessfulRequests: false,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many authentication attempts. Please try again later."
    }
  });

// =========================================================
// ADMIN RATE LIMIT
// =========================================================

const adminLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 120,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many administrative requests."
    }
  });

// =========================================================
// SECURITY REQUEST LOGGER
// =========================================================

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration =
      Date.now() - start;

    const requestPath =
      req.path || "";

    const isSecurityRoute =
      requestPath.startsWith(
        `${API_PREFIX}/auth`
      ) ||
      requestPath.startsWith(
        `${API_PREFIX}/admin`
      );

    if (isSecurityRoute) {
      console.log(
        `[SECURITY] ${req.method} ${requestPath} ${res.statusCode} ${duration}ms`
      );
    }
  });

  next();
});

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "AutoVerse API",
    status: "online"
  });
});

// =========================================================
// API HEALTH
// =========================================================

app.get(
  `${API_PREFIX}/health`,
  (req, res) => {
    return res.status(200).json({
      success: true,
      service: "AutoVerse API",
      status: "online"
    });
  }
);

// =========================================================
// AUTH ROUTES
// =========================================================

/*
 * Available endpoints:
 *
 * GET  /api/auth/csrf
 * POST /api/auth/login
 * POST /api/auth/signup
 * GET  /api/auth/me
 * POST /api/auth/logout
 */

app.use(
  `${API_PREFIX}/auth`,
  authLimiter,
  authRoutes
);

// =========================================================
// ADMIN ROUTES
// =========================================================

/*
 * Available endpoints include:
 *
 * GET    /api/admin/dashboard
 * GET    /api/admin/cars
 * POST   /api/admin/cars
 * PUT    /api/admin/cars/:id
 * PATCH  /api/admin/cars/:id/archive
 * PATCH  /api/admin/cars/:id/restore
 * POST   /api/admin/import
 * POST   /api/admin/import/preview
 * GET    /api/admin/cars-export
 */

app.use(
  `${API_PREFIX}/admin`,
  adminLimiter,
  adminRoutes
);

// =========================================================
// CAR ROUTES
// =========================================================

app.use(
  `${API_PREFIX}/cars`,
  carRoutes
);

// =========================================================
// AI ROUTES
// =========================================================

app.use(
  `${API_PREFIX}/ai`,
  aiRoutes
);

// =========================================================
// IMAGES
// =========================================================

/*
 * Existing AutoVerse image URLs use:
 *
 * https://auto-verse-hcp5.onrender.com/images/filename.jpg
 */

app.use(
  "/images",
  express.static(
    path.join(
      __dirname,
      "images"
    ),
    {
      fallthrough: true,
      maxAge: IS_PRODUCTION
        ? "7d"
        : 0
    }
  )
);

// =========================================================
// API 404
// =========================================================

app.use(
  `${API_PREFIX}/*splat`,
  (req, res) => {
    return res.status(404).json({
      success: false,
      message:
        "API endpoint not found."
    });
  }
);

// =========================================================
// GENERAL 404
// =========================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message:
      "Endpoint not found."
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "API Error:",
      error
    );

    /*
     * CORS error.
     */

    if (
      error?.message ===
      "CORS origin denied."
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Request origin is not allowed."
      });
    }

    /*
     * Production should never expose
     * internal stack traces.
     */

    const message =
      IS_PRODUCTION
        ? "Internal server error."
        : (
          error.message ||
          "Internal server error."
        );

    let status =
      Number.isInteger(error.status)
        ? error.status
        : 500;

    /*
     * Multer upload errors.
     */

    if (
      error.name ===
      "MulterError"
    ) {
      status = 400;
    }

    return res
      .status(status)
      .json({
        success: false,
        message
      });
  }
);

// =========================================================
// DATABASE + SERVER
// =========================================================

async function startServer() {
  try {
    /*
     * MongoDB
     */

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing."
      );
    }

    /*
     * JWT
     */

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is missing."
      );
    }

    if (
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error(
        "JWT_SECRET must contain at least 32 characters."
      );
    }

    /*
     * Production frontend URL.
     */

    if (
      IS_PRODUCTION &&
      configuredOrigins.length === 0
    ) {
      throw new Error(
        "FRONTEND_URL must be configured in production."
      );
    }

    /*
     * MongoDB connection.
     */

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB Connected"
    );

    /*
     * Start server.
     */

    app.listen(
      PORT,
      () => {
        console.log(
          `🚀 Server running on port ${PORT}`
        );

        console.log(
          `🔐 API mounted at ${API_PREFIX}`
        );

        console.log(
          "🌐 CORS origins:"
        );

        allowedOrigins.forEach(
          origin => {
            console.log(
              `   ✓ ${origin}`
            );
          }
        );

        console.log(
          "========================================"
        );
      }
    );

  } catch (error) {
    console.error(
      "❌ Server startup failed:",
      error
    );

    process.exit(1);
  }
}

// =========================================================
// START
// =========================================================

startServer();