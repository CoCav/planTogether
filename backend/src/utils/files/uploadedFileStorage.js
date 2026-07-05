const fs = require("fs");
const path = require("path");

const logger = require("../../config/logger");

/* ==========================================================================
   Uploaded File Storage

   Provides helpers for managing uploaded files.

   Responsibilities
   - Delete uploaded files safely
   - Normalize upload paths
   - Prevent directory traversal
   - Log file deletion failures

   Notes
   - Only files inside the upload directory can be deleted.
   - Missing files are ignored silently.
=========================================================================== */

const DEFAULT_UPLOAD_DIRECTORY = "uploads";

const uploadDirectory = process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIRECTORY;

// Delete an uploaded file safely.
const deleteUploadedFile = async (filePath) => {
    if (!filePath) return;

    try {
        // Normalize the stored path by removing the leading slash.
        const normalizedPath = filePath.startsWith("/")
            ? filePath.slice(1)
            : filePath;

        // Prevent deleting files outside the configured upload directory.
        const isInsideUploadDirectory =
            normalizedPath === uploadDirectory ||
            normalizedPath.startsWith(`${uploadDirectory}/`);

        if (!isInsideUploadDirectory) {
            logger.warn(
                { filePath },
                "Attempted to delete a file outside the upload directory"
            );
            return;
        }

        // Resolve the absolute file path from the project root.
        const absolutePath = path.join(__dirname, "..", "..", "..", normalizedPath);

        // Delete the file only if it still exists.
        if (fs.existsSync(absolutePath)) {
            await fs.promises.unlink(absolutePath);
        }

    } catch (error) {
        logger.warn(
            { error, filePath },
            "Failed to delete uploaded file"
        );
    }
};

module.exports = { deleteUploadedFile };
