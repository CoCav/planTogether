/* ==========================================================================
   User Controller

   Re-exports user controllers by access level.

   Responsibilities
   - Expose authenticated user controllers
   - Expose public user controllers

   Notes
   - Authenticated and public user controllers live in dedicated submodules.
=========================================================================== */

module.exports = {
    ...require("./users/authenticatedUserController"),
    ...require("./users/publicUserController")
};
