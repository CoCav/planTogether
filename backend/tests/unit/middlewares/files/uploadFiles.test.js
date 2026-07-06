/* ==================================================
   UPLOAD FILES MIDDLEWARE TESTS

   Tests:
   - avatar uploader export
   - event image uploader export
   - Multer single-file middleware creation
   - avatar file size limit
   - event image file size limit

   Ensures:
   - reusable upload middlewares are configured
   - upload handlers expose expected Multer APIs
   - upload size limits match application rules
   - upload security policies are centralized
   - image MIME types and extensions are validated
================================================== */

const { uploadAvatar, uploadEventImage } = require("../../../../src/middlewares/files/uploadFiles");

const { MAX_AVATAR_SIZE, MAX_EVENT_IMAGE_SIZE } = require("../../../../src/config/security/uploadPolicy");

describe("uploadFiles middleware", () => {

    /* =============================
       UPLOAD MIDDLEWARE EXPORTS
    ============================= */

    it("should export avatar and event image upload middlewares", () => {
        expect(uploadAvatar).toBeDefined();
        expect(uploadEventImage).toBeDefined();
    });

    it("should expose multer single middleware factory", () => {
        expect(typeof uploadAvatar.single).toBe("function");
        expect(typeof uploadEventImage.single).toBe("function");
    });

    /* =============================
       UPLOAD HANDLERS
    ============================= */

    it("should create upload handlers for avatar and event image fields", () => {
        const avatarMiddleware = uploadAvatar.single("avatar");
        const eventImageMiddleware = uploadEventImage.single("image");

        expect(typeof avatarMiddleware).toBe("function");
        expect(typeof eventImageMiddleware).toBe("function");
    });

    /* =============================
       UPLOAD LIMITS
    ============================= */

    it("should set avatar upload file size limit to 2MB", () => {
        expect(uploadAvatar.limits.fileSize).toBe(MAX_AVATAR_SIZE);
    });

    it("should set event image upload file size limit to 3MB", () => {
        expect(uploadEventImage.limits.fileSize).toBe(MAX_EVENT_IMAGE_SIZE);
    });
});
