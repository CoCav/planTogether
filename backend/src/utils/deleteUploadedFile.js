const fs = require("fs");
const path = require("path");

/* ==================================================
   DELETE UPLOADED FILE
   Safely removes an uploaded local file from storage
================================================== */

const deleteUploadedFile = async (filePath) => {
    if (!filePath) return;

    try {
        const normalizedPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

        const absolutePath = path.join(__dirname, "..", "..", normalizedPath);

        if (fs.existsSync(absolutePath)) {
            await fs.promises.unlink(absolutePath);
        }
    } catch (error) {
        console.warn("Failed to delete uploaded file:", error.message);
    }
};

module.exports = deleteUploadedFile;
