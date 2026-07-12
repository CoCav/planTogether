const {
    ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_AVATAR_SIZE,
    MAX_EVENT_IMAGE_SIZE
} = require("../../../../src/config/security/uploadPolicy");

/* ==========================================================================
   Upload Policy Unit Tests

   Tests shared upload security configuration.

   Responsibilities
   - Test allowed image MIME types
   - Test allowed image extensions
   - Test avatar upload size limit
   - Test event image upload size limit

   Notes
   - Upload policy must stay aligned with frontend validation.
=========================================================================== */

describe("uploadPolicy config", () => {

    /* =============================
       ALLOWED FILE TYPES
    ============================= */

    describe("Allowed file types", () => {
        it("exposes allowed image MIME types", () => {
            expect(ALLOWED_IMAGE_MIME_TYPES).toEqual([
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"
            ]);
        });

        it("exposes allowed image file extensions", () => {
            expect(ALLOWED_IMAGE_EXTENSIONS).toEqual([
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".gif"
            ]);
        });
    });

    /* =============================
       UPLOAD SIZE LIMITS
    ============================= */

    describe("Upload size limits", () => {
        it("exposes the avatar upload size limit", () => {
            expect(MAX_AVATAR_SIZE).toBe(2 * 1024 * 1024);
        });

        it("exposes the event image upload size limit", () => {
            expect(MAX_EVENT_IMAGE_SIZE).toBe(3 * 1024 * 1024);
        });
    });
});
