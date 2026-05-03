const { uploadAvatar, uploadEventImage } = require("../../src/middlewares/uploadFile");

/* ==================================================
   UPLOAD FILE MIDDLEWARE TESTS
   Tests reusable Multer upload handlers configuration
================================================== */

describe("uploadFile", () => {
    it("exports avatar and event image upload middlewares", () => {
        expect(uploadAvatar).toBeDefined();
        expect(uploadEventImage).toBeDefined();
    });

    it("creates multer middleware functions", () => {
        expect(typeof uploadAvatar.single).toBe("function");
        expect(typeof uploadEventImage.single).toBe("function");
    });

    it("creates upload handlers for avatar and event image fields", () => {
        const avatarMiddleware = uploadAvatar.single("avatar");
        const eventImageMiddleware = uploadEventImage.single("image");

        expect(typeof avatarMiddleware).toBe("function");
        expect(typeof eventImageMiddleware).toBe("function");
    });

    it("sets avatar upload file size limit to 2MB", () => {
        expect(uploadAvatar.limits.fileSize).toBe(2 * 1024 * 1024);
    });

    it("sets event image upload file size limit to 3MB", () => {
        expect(uploadEventImage.limits.fileSize).toBe(3 * 1024 * 1024);
    });
});
