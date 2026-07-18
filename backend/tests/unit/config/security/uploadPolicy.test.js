const {
    IMAGE_TYPE_POLICY,
    ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_AVATAR_SIZE,
    MAX_EVENT_IMAGE_SIZE
} = require("../../../../src/config/security/uploadPolicy");

/* ==========================================================================
   Upload Policy Unit Tests

   Tests shared upload security configuration.

   Responsibilities
   - Test valid MIME type and extension pairs
   - Test derived allowed image MIME types
   - Test derived allowed image extensions
   - Test avatar upload size limit
   - Test event image upload size limit

   Notes
   - Allowed MIME types and extensions are derived from IMAGE_TYPE_POLICY.
   - Upload policy must stay aligned with frontend validation.
=========================================================================== */

describe("upload policy config", () => {

    /* =============================
       IMAGE TYPE POLICY
    ============================= */

    describe("Image type policy", () => {
        it("exposes valid MIME type and extension pairs", () => {
            expect(IMAGE_TYPE_POLICY).toEqual({
                ".jpg": [
                    "image/jpeg"
                ],
                ".jpeg": [
                    "image/jpeg"
                ],
                ".png": [
                    "image/png"
                ],
                ".webp": [
                    "image/webp"
                ],
                ".gif": [
                    "image/gif"
                ]
            });
        });

        it.each([
            [".jpg", "image/jpeg"],
            [".jpeg", "image/jpeg"],
            [".png", "image/png"],
            [".webp", "image/webp"],
            [".gif", "image/gif"]
        ])("allows %s files with %s",
            (extension, mimeType) => {
                expect(IMAGE_TYPE_POLICY[extension]).toContain(mimeType);
            }
        );
    });

    /* =============================
       DERIVED ALLOWED FILE TYPES
    ============================= */

    describe("Derived allowed file types", () => {
        it("derives allowed image MIME types from the policy", () => {
            expect(ALLOWED_IMAGE_MIME_TYPES).toEqual([
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"
            ]);
        });

        it("does not expose duplicate MIME types", () => {
            expect(new Set(ALLOWED_IMAGE_MIME_TYPES).size).toBe(ALLOWED_IMAGE_MIME_TYPES.length);
        });

        it("derives allowed image extensions from the policy", () => {
            expect(ALLOWED_IMAGE_EXTENSIONS).toEqual([
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".gif"
            ]);
        });

        it("keeps allowed extensions aligned with the policy keys", () => {
            expect(ALLOWED_IMAGE_EXTENSIONS).toEqual(Object.keys(IMAGE_TYPE_POLICY));
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
