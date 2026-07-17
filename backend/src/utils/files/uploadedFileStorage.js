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

/* =============================
   STORAGE CONFIGURATION
============================= */

const DEFAULT_UPLOAD_DIRECTORY = "uploads";

// Resolve the configured upload root directory

const uploadDirectory = process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIRECTORY;

/* =============================
   FILE DELETION
============================= */

// Delete an uploaded file without allowing directory traversal
const deleteUploadedFile = async (filePath) => {
    if (!filePath) return;

    try {
        // Normalize the stored path by removing the leading slash
        const normalizedPath = filePath.startsWith("/")
            ? filePath.slice(1)
            : filePath;

        const projectRoot = path.resolve(
            __dirname,
            "..",
            "..",
            ".."
        );

        const uploadRoot = path.resolve(projectRoot, uploadDirectory);
        const absolutePath = path.resolve(projectRoot, normalizedPath);
        const relativePath = path.relative(uploadRoot, absolutePath);

        // Prevent deleting the upload root or files outside it
        const isInsideUploadDirectory =
            relativePath !== "" &&
            relativePath !== ".." &&
            !relativePath.startsWith(`..${path.sep}`) &&
            !path.isAbsolute(relativePath);

        if (!isInsideUploadDirectory) {
            logger.warn({ filePath }, "Attempted to delete a file outside the upload directory");

            return;
        }

        // Delete the file only if it still exists
        if (fs.existsSync(absolutePath)) {
            await fs.promises.unlink(absolutePath);
        }

    } catch (error) {
        logger.warn({ error, filePath }, "Failed to delete uploaded file");
    }
};

module.exports = { deleteUploadedFile };
