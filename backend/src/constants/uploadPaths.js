/* ==========================================================================
   Upload Path Constants

   Defines public paths for uploaded files.

   Responsibilities
   - Define avatar upload paths
   - Define event image upload paths
   - Keep uploaded file URL construction consistent

   Notes
   - These paths are exposed through API responses.
   - File-system storage directories remain configured separately.
=========================================================================== */

const UPLOAD_PATHS = {
    AVATARS: "/uploads/avatars",
    EVENTS: "/uploads/events"
};

module.exports = {
    UPLOAD_PATHS
};
