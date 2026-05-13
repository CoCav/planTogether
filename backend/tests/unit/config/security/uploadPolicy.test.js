/* ==================================================
   UPLOAD POLICY TESTS

   Tests:
   - allowed MIME types
   - allowed file extensions
   - upload size limits

   Ensures:
   - upload security rules stay centralized and consistent
================================================== */

const {
    ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_AVATAR_SIZE,
    MAX_EVENT_IMAGE_SIZE
} = require("../../../../src/config/security/uploadPolicy");

describe("uploadPolicy config", () => {

    /* =============================
       MIME TYPES
    ============================= */

    it("should expose allowed image MIME types", () => {
        expect(ALLOWED_IMAGE_MIME_TYPES).toEqual([
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ]);
    });

    /* =============================
       FILE EXTENSIONS
    ============================= */

    it("should expose allowed image file extensions", () => {
        expect(ALLOWED_IMAGE_EXTENSIONS).toEqual([
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif"
        ]);
    });

    /* =============================
       SIZE LIMITS
    ============================= */

    it("should expose upload size limits", () => {
        expect(MAX_AVATAR_SIZE).toBe(2 * 1024 * 1024);

        expect(MAX_EVENT_IMAGE_SIZE).toBe(3 * 1024 * 1024);
    });
});
