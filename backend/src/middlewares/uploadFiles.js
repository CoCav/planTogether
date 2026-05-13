const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { createHttpError } = require("../utils/errors/httpError");

const { ALLOWED_IMAGE_MIME_TYPES, ALLOWED_IMAGE_EXTENSIONS, MAX_AVATAR_SIZE, MAX_EVENT_IMAGE_SIZE } = require("../config/security/uploadPolicy");

/* ==================================================
   UPLOAD FILES MIDDLEWARE

   Handles:
   - reusable image upload configuration
   - avatar uploads
   - event image uploads
   - upload folder creation
   - image MIME type validation
   - image extension validation
   - upload size limits
   - centralized file deletion warnings

   Notes:
   - files are stored under UPLOAD_DIR or "uploads"
   - generated filenames do not trust original filenames
   - upload errors are handled by the global error handler
================================================== */

const baseUploadDir = process.env.UPLOAD_DIR || "uploads";

// Create a safe random filename while preserving validated extension
const createSafeFileName = (prefix, originalName) => {
    const ext = path.extname(originalName).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    return `${prefix}-${uniqueSuffix}${ext}`;
};

// Create a reusable Multer image uploader
const createImageUpload = ({ folder, prefix, maxSize }) => {
    const uploadDir = path.join(__dirname, "../../", baseUploadDir, folder);

    // Ensure target upload folder exists before saving files
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },

        filename: (req, file, cb) => {
            cb(null, createSafeFileName(prefix, file.originalname));
        }
    });

    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        const hasAllowedMimeType = ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype);
        const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

        // Reject files that do not match allowed image MIME types and extensions
        if (!hasAllowedMimeType || !hasAllowedExtension) {
            return cb(
                createHttpError(400, "Only valid image files are allowed"),
                false
            );
        }

        cb(null, true);
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize
        }
    });
};

// Avatar upload configuration
const uploadAvatar = createImageUpload({
    folder: "avatars",
    prefix: "avatar",
    maxSize: MAX_AVATAR_SIZE
});

// Event image upload configuration
const uploadEventImage = createImageUpload({
    folder: "events",
    prefix: "event",
    maxSize: MAX_EVENT_IMAGE_SIZE
});

module.exports = { uploadAvatar, uploadEventImage };
