/*
 * =========================================================
 * AUTOVERSE ADMIN AUTHORIZATION
 * =========================================================
 *
 * This middleware MUST run after auth.js.
 *
 * auth.js obtains the user from the database.
 *
 * The frontend, localStorage and JWT payload are
 * NOT trusted for administrator authorization.
 * =========================================================
 */

export default function admin(
  req,
  res,
  next
) {

  if (!req.user) {

    return res.status(401).json({

      success:
        false,

      message:
        "Authentication required."

    });

  }


  /*
   * Role comes from the database through auth.js.
   */

  if (
    req.user.role !== "admin"
  ) {

    return res.status(403).json({

      success:
        false,

      message:
        "Administrator access required."

    });

  }


  return next();

}