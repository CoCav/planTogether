jest.mock("fs", () => ({
    existsSync: jest.fn(),
    promises: {
        unlink: jest.fn()
    }
}));

const fs = require("fs");
const deleteUploadedFile = require("../../src/utils/deleteUploadedFile");

/* ==================================================
   DELETE UPLOADED FILE TESTS
   Tests safe uploaded file deletion helper
================================================== */

describe("deleteUploadedFile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("does nothing when file path is missing", async () => {
        await deleteUploadedFile(null);
        await deleteUploadedFile(undefined);
        await deleteUploadedFile("");

        expect(fs.existsSync).not.toHaveBeenCalled();
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it("deletes file when it exists", async () => {
        fs.existsSync.mockReturnValue(true);
        fs.promises.unlink.mockResolvedValue();

        await deleteUploadedFile("/uploads/avatars/avatar-test.png");

        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.promises.unlink).toHaveBeenCalled();
    });

    it("does not delete file when it does not exist", async () => {
        fs.existsSync.mockReturnValue(false);

        await deleteUploadedFile("/uploads/avatars/missing.png");

        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it("does not delete file outside upload directory", async () => {
        await deleteUploadedFile("/other-folder/file.png");

        expect(fs.existsSync).not.toHaveBeenCalled();
        expect(fs.promises.unlink).not.toHaveBeenCalled();

        expect(console.warn).toHaveBeenCalledWith(
            "Invalid file path, outside upload directory"
        );
    });

    it("does not throw when unlink fails", async () => {
        fs.existsSync.mockReturnValue(true);
        fs.promises.unlink.mockRejectedValue(new Error("unlink failed"));

        await expect(deleteUploadedFile("/uploads/events/event-test.png")).resolves.toBeUndefined();

        expect(console.warn).toHaveBeenCalledWith(
            "Failed to delete uploaded file:",
            "unlink failed"
        );
    });
});
