const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { createHttpError } = require("../../utils/errors/httpError");

const {
    ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_AVATAR_SIZE,
    MAX_EVENT_IMAGE_SIZE
} = require("../../config/security/uploadPolicy");

/* ==========================================================================
   Upload Files Middleware

   Configures reusable image upload middlewares.

   Responsibilities
   - Configure avatar uploads
   - Configure event image uploads
   - Create upload folders when needed
   - Validate image MIME types and extensions
   - Enforce upload size limits
   - Generate safe upload filenames

   Notes
   - Files are stored under UPLOAD_DIR or the default uploads directory.
   - Generated filenames do not trust original filenames.
   - Upload errors are forwarded to the global error handler.
=========================================================================== */

const DEFAULT_UPLOAD_DIRECTORY = "uploads";

const AVATAR_UPLOAD_FOLDER = "avatars";
const EVENT_IMAGE_UPLOAD_FOLDER = "events";

const AVATAR_UPLOAD_PREFIX = "avatar";
const EVENT_UPLOAD_PREFIX = "event";

const uploadDirectory = process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIRECTORY;

// Generate a unique filename while preserving the validated extension.
const generateUploadFileName = (prefix, originalName) => {
    const extension = path.extname(originalName).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    return `${prefix}-${uniqueSuffix}${extension}`;
};

// Create a reusable Multer uploader for image files.
const createImageUploader = ({ folder, prefix, maxSize }) => {
    const uploadPath = path.join(
        __dirname,
        "../../../",
        uploadDirectory,
        folder
    );

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },

        filename: (req, file, cb) => {
            cb(null, generateUploadFileName(prefix, file.originalname));
        }
    });

    const fileFilter = (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const hasAllowedMimeType =
            ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype);

        const hasAllowedExtension =
            ALLOWED_IMAGE_EXTENSIONS.includes(extension);

        // Reject files that do not match the allowed image formats.
        if (!hasAllowedMimeType || !hasAllowedExtension) {
            return cb(
                createHttpError(400, "Only valid image files are allowed"),
                false
            );
        }

        return cb(null, true);
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize
        }
    });
};

// Configure avatar uploads.
const uploadAvatar = createImageUploader({
    folder: AVATAR_UPLOAD_FOLDER,
    prefix: AVATAR_UPLOAD_PREFIX,
    maxSize: MAX_AVATAR_SIZE
});

// Configure event image uploads.
const uploadEventImage = createImageUploader({
    folder: EVENT_IMAGE_UPLOAD_FOLDER,
    prefix: EVENT_UPLOAD_PREFIX,
    maxSize: MAX_EVENT_IMAGE_SIZE
});

module.exports = {
    uploadAvatar,
    uploadEventImage
};
