const { UPLOAD_PATHS } = require("../../../src/constants/uploadPaths");

/* ==========================================================================
   Upload Path Constants Unit Tests

   Tests shared uploaded file public paths.

   Responsibilities
   - Test the avatar upload path
   - Test the event image upload path

   Notes
   - These paths are used when building API response file URLs.
=========================================================================== */

describe("upload path constants", () => {

    /* =============================
       UPLOAD PATHS
    ============================= */

    describe("UPLOAD_PATHS", () => {
        it("defines the avatar upload path", () => {
            expect(UPLOAD_PATHS.AVATARS).toBe("/uploads/avatars");
        });

        it("defines the event image upload path", () => {
            expect(UPLOAD_PATHS.EVENTS).toBe("/uploads/events");
        });
    });
});
