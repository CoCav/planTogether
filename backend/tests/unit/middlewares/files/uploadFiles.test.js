/* =============================
   MOCK FUNCTIONS
============================= */

const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();

const mockDiskStorage = jest.fn((options) => ({
    type: "disk-storage",
    options
}));

const mockMulterFactory = jest.fn((options) => ({
    storage: options.storage,
    fileFilter: options.fileFilter,
    limits: options.limits,
    single: jest.fn(() => jest.fn())
}));

/* =============================
   TEST MOCKS
============================= */

jest.mock("fs", () => ({
    existsSync: mockExistsSync,
    mkdirSync: mockMkdirSync
}));

jest.mock("multer", () => {
    const multer = jest.fn((options) => {
        return mockMulterFactory(options);
    });

    multer.diskStorage = jest.fn((options) => {
        return mockDiskStorage(options);
    });

    return multer;
});

/* =============================
   TEST HELPERS
============================= */

const loadUploadFiles = () => {
    jest.resetModules();

    return require("../../../../src/middlewares/files/uploadFiles");
};

/* =============================
   TEST IMPORTS
============================= */

const path = require("path");

const {
    MAX_AVATAR_SIZE,
    MAX_EVENT_IMAGE_SIZE
} = require("../../../../src/config/security/uploadPolicy");

/* ==========================================================================
   Upload Files Middleware Unit Tests

   Tests reusable image upload middleware configuration.

   Responsibilities
   - Test avatar and event image uploader exports
   - Test upload directory creation
   - Test configurable upload directories
   - Test upload storage destinations
   - Test generated upload filenames
   - Test image MIME type and extension validation
   - Test upload size limits

   Notes
   - Multer storage and file system operations are mocked.
   - Filename generation is tested through the configured storage callback.
=========================================================================== */

describe("upload files middleware", () => {
    const originalUploadDirectory = process.env.UPLOAD_DIR;

    beforeEach(() => {
        jest.clearAllMocks();

        delete process.env.UPLOAD_DIR;

        mockExistsSync.mockReturnValue(true);
    });

    afterEach(() => {
        process.env.UPLOAD_DIR = originalUploadDirectory;

        jest.restoreAllMocks();
        jest.resetModules();
    });

    /* =============================
       UPLOAD MIDDLEWARE EXPORTS
    ============================= */

    describe("Uploader exports", () => {
        it("exports avatar and event image uploaders", () => {
            const {
                uploadAvatar,
                uploadEventImage
            } = loadUploadFiles();

            expect(uploadAvatar).toBeDefined();
            expect(uploadEventImage).toBeDefined();

            expect(typeof uploadAvatar.single).toBe("function");
            expect(typeof uploadEventImage.single).toBe("function");
        });

        it("creates single-file middleware handlers", () => {
            const {
                uploadAvatar,
                uploadEventImage
            } = loadUploadFiles();

            const avatarMiddleware = uploadAvatar.single("avatar");
            const eventImageMiddleware = uploadEventImage.single("image");

            expect(typeof avatarMiddleware).toBe("function");
            expect(typeof eventImageMiddleware).toBe("function");

            expect(uploadAvatar.single).toHaveBeenCalledWith("avatar");
            expect(uploadEventImage.single).toHaveBeenCalledWith("image");
        });
    });

    /* =============================
       UPLOAD DIRECTORIES
    ============================= */

    describe("Upload directories", () => {
        it("creates missing avatar and event upload directories", () => {
            mockExistsSync.mockReturnValue(false);

            loadUploadFiles();

            const avatarUploadPath = path.join(
                __dirname,
                "../../../..",
                "uploads",
                "avatars"
            );

            const eventUploadPath = path.join(
                __dirname,
                "../../../..",
                "uploads",
                "events"
            );

            expect(mockExistsSync).toHaveBeenNthCalledWith(1, avatarUploadPath);

            expect(mockExistsSync).toHaveBeenNthCalledWith(2, eventUploadPath);

            expect(mockMkdirSync).toHaveBeenNthCalledWith(1, avatarUploadPath, {
                recursive: true
            });

            expect(mockMkdirSync).toHaveBeenNthCalledWith(2, eventUploadPath, {
                recursive: true
            });
        });

        it("does not recreate existing upload directories", () => {
            mockExistsSync.mockReturnValue(true);

            loadUploadFiles();

            expect(mockExistsSync).toHaveBeenCalledTimes(2);
            expect(mockMkdirSync).not.toHaveBeenCalled();
        });

        it("uses the configured upload directory", () => {
            process.env.UPLOAD_DIR = "storage";

            mockExistsSync.mockReturnValue(false);

            loadUploadFiles();

            expect(mockMkdirSync).toHaveBeenNthCalledWith(1, path.join(
                __dirname,
                "../../../..",
                "storage",
                "avatars"
            ), {
                recursive: true
            });

            expect(mockMkdirSync).toHaveBeenNthCalledWith(2, path.join(
                __dirname,
                "../../../..",
                "storage",
                "events"
            ), {
                recursive: true
            });
        });
    });

    /* =============================
       STORAGE CONFIGURATION
    ============================= */

    describe("Storage configuration", () => {
        it("configures avatar and event image destinations", () => {
            loadUploadFiles();

            const avatarStorageOptions = mockDiskStorage.mock.calls[0][0];
            const eventStorageOptions = mockDiskStorage.mock.calls[1][0];

            const avatarCallback = jest.fn();
            const eventCallback = jest.fn();

            avatarStorageOptions.destination({}, {}, avatarCallback);
            eventStorageOptions.destination({}, {}, eventCallback);

            expect(avatarCallback).toHaveBeenCalledWith(null, path.join(
                __dirname,
                "../../../..",
                "uploads",
                "avatars"
            ));

            expect(eventCallback).toHaveBeenCalledWith(null, path.join(
                __dirname,
                "../../../..",
                "uploads",
                "events"
            ));
        });

        it("generates a safe avatar filename with a normalized extension", () => {
            jest.spyOn(Date, "now").mockReturnValue(1234567890);

            jest.spyOn(Math, "random").mockReturnValue(0.123456789);

            loadUploadFiles();

            const avatarStorageOptions = mockDiskStorage.mock.calls[0][0];

            const callback = jest.fn();

            avatarStorageOptions.filename({}, {
                originalname: "Profile.PnG"
            }, callback);

            expect(callback).toHaveBeenCalledWith(null, "avatar-1234567890-123456789.png");
        });

        it("generates a safe event image filename", () => {
            jest.spyOn(Date, "now").mockReturnValue(9876543210);

            jest.spyOn(Math, "random").mockReturnValue(0.5);

            loadUploadFiles();

            const eventStorageOptions = mockDiskStorage.mock.calls[1][0];

            const callback = jest.fn();

            eventStorageOptions.filename({}, {
                originalname: "Event Image.WEBP"
            }, callback);

            expect(callback).toHaveBeenCalledWith(null, "event-9876543210-500000000.webp");
        });
    });

    /* =============================
       UPLOAD SECURITY
    ============================= */

    describe("Upload security", () => {
        it.each([
            ["JPEG", "avatar.jpg", "image/jpeg"],
            ["JPEG extension", "avatar.jpeg", "image/jpeg"],
            ["PNG with uppercase extension", "avatar.PNG", "image/png"],
            ["WebP", "avatar.webp", "image/webp"],
            ["GIF", "avatar.gif", "image/gif"]
        ])(
            "accepts a valid %s image", (_, originalname, mimetype) => {
                loadUploadFiles();

                const avatarOptions = mockMulterFactory.mock.calls[0][0];

                const callback = jest.fn();

                avatarOptions.fileFilter({}, {
                    originalname,
                    mimetype
                }, callback);

                expect(callback).toHaveBeenCalledTimes(1);
                expect(callback).toHaveBeenCalledWith(null, true);
            }
        );

        it.each([[
            "invalid MIME type",
            "avatar.png",
            "application/octet-stream"
        ], [
            "invalid extension",
            "avatar.exe",
            "image/png"
        ], [
            "misleading double extension",
            "avatar.png.exe",
            "image/png"
        ], [
            "valid extension with mismatched MIME type",
            "avatar.jpg",
            "image/png"
        ]])(
            "rejects an image with %s", (_, originalname, mimetype) => {
                loadUploadFiles();

                const avatarOptions = mockMulterFactory.mock.calls[0][0];

                const callback = jest.fn();

                avatarOptions.fileFilter({}, {
                    originalname,
                    mimetype
                }, callback);

                expect(callback).toHaveBeenCalledTimes(1);

                const [error, accepted] = callback.mock.calls[0];

                expect(error).toMatchObject({
                    message: "Only valid image files are allowed",
                    statusCode: 400
                });

                expect(accepted).toBe(false);
            }
        );
    });

    /* =============================
       UPLOAD LIMITS
    ============================= */

    describe("Upload limits", () => {
        it("configures the avatar upload size limit", () => {
            const { uploadAvatar } = loadUploadFiles();

            expect(uploadAvatar.limits).toEqual({
                fileSize: MAX_AVATAR_SIZE
            });
        });

        it("configures the event image upload size limit", () => {
            const { uploadEventImage } = loadUploadFiles();

            expect(uploadEventImage.limits).toEqual({
                fileSize: MAX_EVENT_IMAGE_SIZE
            });
        });
    });
});
