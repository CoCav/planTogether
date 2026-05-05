const fs = require("fs");
const path = require("path");

/* ==================================================
   DELETE UPLOADED FILE

   Handles:
   - safe deletion of uploaded files
   - path normalization
   - protection against directory traversal

   Notes:
   - only files inside UPLOAD_DIR can be deleted
   - silently fails if file does not exist
================================================== */

const baseUploadDir = process.env.UPLOAD_DIR || "uploads";

// Delete a file from the uploads directory
const deleteUploadedFile = async (filePath) => {
    if (!filePath) return;

    try {
        // Remove leading slash for consistency (/uploads/... → uploads/...)
        const normalizedPath = filePath.startsWith("/")
            ? filePath.slice(1)
            : filePath;

        // Prevent deleting files outside upload directory
        if (!normalizedPath.startsWith(baseUploadDir)) {
            console.warn("Invalid file path, outside upload directory");
            return;
        }

        // Resolve absolute path from project root
        const absolutePath = path.join(__dirname, "..", "..", normalizedPath);

        // Delete file only if it exists
        if (fs.existsSync(absolutePath)) {
            await fs.promises.unlink(absolutePath);
        }

    } catch (error) {
        console.warn("Failed to delete uploaded file:", error.message);
    }
};

module.exports = deleteUploadedFile;
