/* ==================================================
   UPLOADED FILE STORAGE TESTS

   Tests:
   - missing file path handling
   - existing file deletion
   - missing physical file handling
   - path security protection
   - unlink failure handling

   Ensures:
   - uploaded files are deleted safely
   - files outside upload directory are never deleted
   - deletion errors do not crash the app
================================================== */

jest.mock("fs", () => ({
    existsSync: jest.fn(),
    promises: {
        unlink: jest.fn()
    }
}));

const fs = require("fs");

const { deleteUploadedFile } = require("../../../../src/utils/files/uploadedFileStorage");
const { mockConsoleWarn } = require("../../../helpers/mocks/consoleMocks");

describe("uploadedFileStorage utils", () => {

    mockConsoleWarn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       MISSING FILE PATH
    ============================= */

    it("should do nothing when file path is missing", async () => {
        await deleteUploadedFile(null);
        await deleteUploadedFile(undefined);
        await deleteUploadedFile("");

        expect(fs.existsSync).not.toHaveBeenCalled();
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    /* =============================
       FILE DELETION
    ============================= */

    it("should delete file when it exists", async () => {
        fs.existsSync.mockReturnValue(true);
        fs.promises.unlink.mockResolvedValue();

        await deleteUploadedFile("/uploads/avatars/avatar-test.png");

        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.promises.unlink).toHaveBeenCalled();
    });

    it("should not delete file when it does not exist", async () => {
        fs.existsSync.mockReturnValue(false);

        await deleteUploadedFile("/uploads/avatars/missing.png");

        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    /* =============================
       PATH SECURITY
    ============================= */

    it("should not delete file outside upload directory", async () => {
        await deleteUploadedFile("/other-folder/file.png");

        expect(fs.existsSync).not.toHaveBeenCalled();
        expect(fs.promises.unlink).not.toHaveBeenCalled();

        expect(console.warn).toHaveBeenCalledWith("Invalid file path, outside upload directory");
    });

    /* =============================
       UNLINK ERRORS
    ============================= */

    it("should not throw when unlink fails", async () => {
        fs.existsSync.mockReturnValue(true);
        fs.promises.unlink.mockRejectedValue(new Error("unlink failed"));

        await expect(deleteUploadedFile("/uploads/events/event-test.png")).resolves.toBeUndefined();

        expect(console.warn).toHaveBeenCalledWith(
            "Failed to delete uploaded file:",
            "unlink failed"
        );
    });
});
