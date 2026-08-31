import "dotenv/config";

import jwt from "jsonwebtoken";

import User from "../models/user.js";


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


if (
  !JWT_SECRET ||
  JWT_SECRET.length < 32
) {

  throw new Error(
    "JWT_SECRET must be configured with a strong secret."
  );

}


/* =========================================================
   TOKEN EXTRACTION
========================================================= */

function extractToken(
  req
) {

  /*
   * Browser sessions use the HttpOnly cookie.
   */

  const cookieToken =
    req.cookies?.[
    COOKIE_NAME
    ];


  if (
    cookieToken
  ) {

    return cookieToken;

  }


  /*
   * Bearer tokens are retained only for
   * non-browser/API clients.
   *
   * The AutoVerse frontend never stores
   * its JWT in localStorage.
   */

  const authorization =
    req.headers.authorization;


  if (
    typeof authorization ===
    "string" &&
    authorization.startsWith(
      "Bearer "
    )
  ) {

    const bearerToken =
      authorization
        .slice(7)
        .trim();


    if (
      bearerToken
    ) {

      return bearerToken;

    }

  }


  return null;

}


/* =========================================================
   AUTHENTICATION
========================================================= */

export default async function auth(
  req,
  res,
  next
) {

  try {

    const token =
      extractToken(
        req
      );


    if (
      !token
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Authentication required."

      });

    }


    /* -----------------------------------------------------
       VERIFY JWT
    ----------------------------------------------------- */

    const decoded =
      jwt.verify(

        token,

        JWT_SECRET,

        {

          issuer:
            JWT_ISSUER,

          audience:
            JWT_AUDIENCE,

          algorithms:
            ["HS256"]

        }

      );


    if (
      !decoded?.id ||
      decoded.type !==
      "access"
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Invalid authentication token."

      });

    }


    /* -----------------------------------------------------
       LOAD USER FROM DATABASE
    ----------------------------------------------------- */

    const user =
      await User
        .findById(
          decoded.id
        )
        .select(
          "_id username role status authVersion"
        );


    if (
      !user
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Authentication failed."

      });

    }


    /* -----------------------------------------------------
       ACCOUNT STATUS
    ----------------------------------------------------- */

    if (
      user.status !==
      "active"
    ) {

      return res.status(403).json({

        success:
          false,

        message:
          "Account is not active."

      });

    }


    /* -----------------------------------------------------
       SESSION GENERATION
    ----------------------------------------------------- */

    const tokenVersion =
      Number(
        decoded.v ?? 0
      );


    const currentVersion =
      Number(
        user.authVersion ?? 0
      );


    /*
     * This is what allows logout,
     * password/session resets and new
     * logins to invalidate old JWTs.
     */

    if (
      tokenVersion !==
      currentVersion
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Session has been revoked."

      });

    }


    /* -----------------------------------------------------
       TRUSTED SERVER-SIDE USER CONTEXT
    ----------------------------------------------------- */

    req.user = {

      id:
        user._id.toString(),

      username:
        user.username,

      role:
        String(
          user.role || "user"
        ).toLowerCase(),

      authVersion:
        currentVersion

    };


    return next();

  } catch (error) {

    if (
      error?.name ===
      "TokenExpiredError"
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Session expired."

      });

    }


    if (

      error?.name ===
      "JsonWebTokenError" ||

      error?.name ===
      "NotBeforeError"

    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Invalid authentication token."

      });

    }


    console.error(
      "Authentication middleware error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Authentication service unavailable."

    });

  }

}