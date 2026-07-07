const { eventIdParamValidator } = require("./shared/paramValidators");

/* ==========================================================================
   Event Like Validators

   Validates event like requests.

   Responsibilities
   - Validate event identifier for like actions

   Notes
   - handleValidationErrors must run after these validators.
   - Authentication is handled by route middleware.
   - Event existence is handled by the service layer.
=========================================================================== */

module.exports = {
    eventIdParamValidator
};
