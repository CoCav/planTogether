/* ==========================================================================
   User Service

   Re-exports user services by access level.

   Responsibilities
   - Expose authenticated user services
   - Expose public user services

   Notes
   - Authenticated and public user services live in dedicated submodules.
=========================================================================== */

module.exports = {
    ...require("./users/authenticatedUserService"),
    ...require("./users/publicUserService")
};
