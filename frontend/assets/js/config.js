"use strict";

/*
 * =========================================================
 * AUTOVERSE API CONFIGURATION
 * =========================================================
 *
 * Local:
 *   http://localhost:5000/api
 *
 * Production:
 *   https://auto-verse-hcp5.onrender.com/api
 *
 * Keep the /api suffix.
 * The backend mounts all application routes under /api.
 * =========================================================
 */

const API_BASE_URL =
  (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  )
    ? "http://localhost:5000/api"
    : "https://auto-verse-hcp5.onrender.com/api";