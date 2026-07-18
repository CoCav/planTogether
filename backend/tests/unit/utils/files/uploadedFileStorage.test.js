/* =============================
   MOCK FUNCTIONS
============================= */

const mockExistsSync = jest.fn();
const mockUnlink = jest.fn();
const mockLoggerWarn = jest.fn();

/* =============================
   TEST HELPERS
============================= */

const loadUploadedFileStorage = () => {
    jest.resetModules();

    return require("../../../../src/utils/files/uploadedFileStorage");
};

/* =============================
   TEST IMPORTS
============================= */

const path = require("path");

/* ==========================================================================
   Uploaded File Storage Utility Unit Tests

   Tests uploaded file deletion behavior.

   Responsibilities
   - Test missing file path handling
   - Test existing file deletion
   - Test missing physical file handling
   - Test configured upload directories
   - Test path traversal protection
   - Test file deletion errors

   Notes
   - Files outside the configured upload directory must never be deleted.
   - File system errors are logged without crashing the application.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("fs", () => ({
    existsSync: mockExistsSync,
    promises: {
        unlink: mockUnlink
    }
}));

jest.mock("../../../../src/config/logger", () => ({
    warn: mockLoggerWarn
}));

describe("uploaded file storage utility", () => {
    const originalUploadDirectory = process.env.UPLOAD_DIR;

    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.UPLOAD_DIR;
    });

    afterEach(() => {
        process.env.UPLOAD_DIR = originalUploadDirectory;
        jest.resetModules();
    });

    /* =============================
       MISSING FILE PATH
    ============================= */

    describe("Missing file path", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["empty string", ""]
        ])(
            "does nothing for a %s file path", async (_, filePath) => {
                const { deleteUploadedFile } = loadUploadedFileStorage();

                await deleteUploadedFile(filePath);

                expect(mockExistsSync).not.toHaveBeenCalled();
                expect(mockUnlink).not.toHaveBeenCalled();
                expect(mockLoggerWarn).not.toHaveBeenCalled();
            });
    });

    /* =============================
       FILE DELETION
    ============================= */

    describe("File deletion", () => {
        it("deletes an existing uploaded file", async () => {
            mockExistsSync.mockReturnValue(true);
            mockUnlink.mockResolvedValue();

            const { deleteUploadedFile } = loadUploadedFileStorage();

            await deleteUploadedFile("/uploads/avatars/avatar-test.png");

            const expectedPath = path.resolve(
                __dirname,
                "../../../..",
                "uploads",
                "avatars",
                "avatar-test.png"
            );

            expect(mockExistsSync).toHaveBeenCalledWith(expectedPath);

            expect(mockUnlink).toHaveBeenCalledWith(expectedPath);
        });

        it("supports stored paths without a leading slash", async () => {
            mockExistsSync.mockReturnValue(true);
            mockUnlink.mockResolvedValue();

            const { deleteUploadedFile } = loadUploadedFileStorage();

            await deleteUploadedFile("uploads/events/event-test.png");

            const expectedPath = path.resolve(
                __dirname,
                "../../../..",
                "uploads",
                "events",
                "event-test.png"
            );

            expect(mockUnlink).toHaveBeenCalledWith(expectedPath);
        });

        it("does not delete a physical file that does not exist", async () => {
            mockExistsSync.mockReturnValue(false);

            const { deleteUploadedFile } = loadUploadedFileStorage();

            await deleteUploadedFile("/uploads/avatars/missing.png");

            expect(mockExistsSync).toHaveBeenCalled();
            expect(mockUnlink).not.toHaveBeenCalled();
        });

        it("uses the configured upload directory", async () => {
            process.env.UPLOAD_DIR = "storage";

            mockExistsSync.mockReturnValue(true);
            mockUnlink.mockResolvedValue();

            const { deleteUploadedFile } = loadUploadedFileStorage();

            await deleteUploadedFile("/storage/events/event-test.png");

            const expectedPath = path.resolve(
                __dirname,
                "../../../..",
                "storage",
                "events",
                "event-test.png"
            );

            expect(mockUnlink).toHaveBeenCalledWith(expectedPath);
        });
    });

    /* =============================
       PATH SECURITY
    ============================= */

    describe("Path security", () => {
        it("rejects files outside the upload directory", async () => {
            const { deleteUploadedFile } = loadUploadedFileStorage();

            await deleteUploadedFile("/other-folder/file.png");

            expect(mockExistsSync).not.toHaveBeenCalled();
            expect(mockUnlink).not.toHaveBeenCalled();

            expect(mockLoggerWarn).toHaveBeenCalledWith({
                filePath: "/other-folder/file.png"
            },
                "Attempted to delete a file outside the upload directory"
            );
        });

        it("rejects directory traversal through the upload path", async () => {
            const { deleteUploadedFile } = loadUploadedFileStorage();

            await deleteUploadedFile("/uploads/../private/file.txt");

            expect(mockExistsSync).not.toHaveBeenCalled();
            expect(mockUnlink).not.toHaveBeenCalled();

            expect(mockLoggerWarn).toHaveBeenCalledWith({
                filePath:
                    "/uploads/../private/file.txt"
            },
                "Attempted to delete a file outside the upload directory"
            );
        });

        it("does not attempt to delete the upload directory itself", async () => {
            const { deleteUploadedFile } = loadUploadedFileStorage();

            await deleteUploadedFile("/uploads");

            expect(mockExistsSync).not.toHaveBeenCalled();
            expect(mockUnlink).not.toHaveBeenCalled();
        });
    });

    /* =============================
       FILE DELETION ERRORS
    ============================= */

    describe("File deletion errors", () => {
        it("logs unlink errors without throwing", async () => {
            const unlinkError = new Error("unlink failed");

            mockExistsSync.mockReturnValue(true);
            mockUnlink.mockRejectedValue(unlinkError);

            const { deleteUploadedFile } = loadUploadedFileStorage();

            await expect(deleteUploadedFile(
                "/uploads/events/event-test.png"
            )).resolves.toBeUndefined();

            expect(mockLoggerWarn).toHaveBeenCalledWith({
                error: unlinkError,
                filePath:
                    "/uploads/events/event-test.png"
            },
                "Failed to delete uploaded file"
            );
        });
    });
});
