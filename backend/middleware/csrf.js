import "dotenv/config";

import crypto from "crypto";


/* =========================================================
   CONFIG
========================================================= */

const IS_PRODUCTION =
  process.env.NODE_ENV === "production";


const CSRF_COOKIE_NAME =
  process.env.CSRF_COOKIE_NAME ||
  "autoverse_csrf";


const COOKIE_SAME_SITE =
  IS_PRODUCTION
    ? "none"
    : "lax";


const CSRF_TTL =
  15 * 60 * 1000;


const SAFE_METHODS =
  new Set([
    "GET",
    "HEAD",
    "OPTIONS"
  ]);


/* =========================================================
   ALLOWED ORIGINS
========================================================= */

function normalizeOrigin(
  value
) {

  return String(value || "")
    .trim()
    .replace(/\/+$/, "");

}


const allowedOrigins =
  (process.env.FRONTEND_URL || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);


/* =========================================================
   COOKIE OPTIONS
========================================================= */

function cookieOptions() {

  return {

    /*
     * CSRF token must be readable by the
     * browser JavaScript client.
     *
     * The authentication JWT remains HttpOnly.
     */

    httpOnly:
      false,

    secure:
      IS_PRODUCTION,

    sameSite:
      COOKIE_SAME_SITE,

    path:
      "/",

    maxAge:
      CSRF_TTL

  };

}


/* =========================================================
   ISSUE CSRF TOKEN
========================================================= */

export function issueCsrfToken(
  res
) {

  const token =
    crypto
      .randomBytes(32)
      .toString("hex");


  res.cookie(
    CSRF_COOKIE_NAME,
    token,
    cookieOptions()
  );


  return token;

}


/* =========================================================
   CONSTANT-TIME COMPARISON
========================================================= */

function safeEqual(
  a,
  b
) {

  if (
    typeof a !== "string" ||
    typeof b !== "string"
  ) {

    return false;

  }


  const left =
    Buffer.from(
      a,
      "utf8"
    );


  const right =
    Buffer.from(
      b,
      "utf8"
    );


  if (
    left.length !==
    right.length
  ) {

    return false;

  }


  return crypto.timingSafeEqual(
    left,
    right
  );

}


/* =========================================================
   ORIGIN VALIDATION
========================================================= */

function isAllowedOrigin(
  origin
) {

  if (!origin) {

    return true;

  }


  if (!allowedOrigins.length) {

    /*
     * In production the server startup check
     * already rejects an empty FRONTEND_URL.
     *
     * This fallback keeps local development usable.
     */

    return !IS_PRODUCTION;

  }


  return allowedOrigins.includes(
    normalizeOrigin(origin)
  );

}


/* =========================================================
   CSRF PROTECTION
========================================================= */

export default function csrfProtection(
  req,
  res,
  next
) {

  /*
   * GET / HEAD / OPTIONS do not change server state.
   */

  if (
    SAFE_METHODS.has(
      req.method
    )
  ) {

    return next();

  }


  /* -------------------------------------------------------
     ORIGIN CHECK
  ------------------------------------------------------- */

  const origin =
    req.get("origin");


  if (
    !isAllowedOrigin(origin)
  ) {

    return res.status(403).json({

      success:
        false,

      message:
        "Request origin is not allowed."

    });

  }


  /* -------------------------------------------------------
     CSRF DOUBLE-SUBMIT TOKEN
  ------------------------------------------------------- */

  const cookieToken =
    req.cookies?.[
      CSRF_COOKIE_NAME
    ];


  const headerToken =
    req.get(
      "X-CSRF-Token"
    );


  if (
    !safeEqual(
      cookieToken,
      headerToken
    )
  ) {

    return res.status(403).json({

      success:
        false,

      message:
        "Invalid security token. Refresh the page and try again."

    });

  }


  return next();

}


/* =========================================================
   CLEAR CSRF COOKIE
========================================================= */

export function clearCsrfCookie(
  res
) {

  res.clearCookie(
    CSRF_COOKIE_NAME,
    {

      httpOnly:
        false,

      secure:
        IS_PRODUCTION,

      sameSite:
        COOKIE_SAME_SITE,

      path:
        "/"

    }
  );

}