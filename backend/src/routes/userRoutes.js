const express = require("express");
const router = express.Router();

const authenticatedUserRoutes = require("./users/authenticatedUserRoutes");
const publicUserRoutes = require("./users/publicUserRoutes");

/* ==========================================================================
   User Routes

   Combines authenticated and public user route groups.

   Responsibilities
   - Mount authenticated user routes
   - Mount public user routes

   Notes
   - /me routes must be mounted before /:id public routes.
=========================================================================== */

router.use(authenticatedUserRoutes);
router.use(publicUserRoutes);

module.exports = router;
