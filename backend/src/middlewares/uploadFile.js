const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ==================================================
   UPLOAD FILE MIDDLEWARE
   Provides reusable Multer configurations for avatar/image uploads

   Handles:
   - dynamic upload directories (avatars, events, etc.)
   - automatic folder creation if missing
   - unique file naming to prevent collisions
   - file type validation (images only)
   - file size limits per use case

   Usage:
   - uploadAvatar → for user profile images
   - uploadEventImage → for event-related images

   Notes:
   - returns Multer instances (use with .single("field"))
   - works with global errorHandler for upload errors
================================================== */

const baseUploadDir = process.env.UPLOAD_DIR || "uploads";

const createImageUpload = ({ folder, prefix, maxSize }) => {
    const uploadDir = path.join(__dirname, "../../", baseUploadDir, folder);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },

        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

            cb(null, uniqueName);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error("Only image files are allowed");
            error.statusCode = 400;
            return cb(error, false);
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

const uploadAvatar = createImageUpload({
    folder: "avatars",
    prefix: "avatar",
    maxSize: 2 * 1024 * 1024
});

const uploadEventImage = createImageUpload({
    folder: "events",
    prefix: "event",
    maxSize: 3 * 1024 * 1024
});

module.exports = { uploadAvatar, uploadEventImage };
