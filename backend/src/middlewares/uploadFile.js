const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ==================================================
   UPLOAD FILE MIDDLEWARE

   Handles:
   - reusable image upload configuration
   - avatar uploads
   - event image uploads
   - upload folder creation
   - image-only validation
   - upload size limits

   Notes:
   - files are stored under UPLOAD_DIR or "uploads"
   - upload errors are handled by the global error handler
================================================== */

const baseUploadDir = process.env.UPLOAD_DIR || "uploads";

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
            const ext = path.extname(file.originalname);

            // Prefix + timestamp + random number prevents filename collisions
            const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

            cb(null, uniqueName);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        // Reject non-image uploads before storage
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

// Avatar upload configuration
const uploadAvatar = createImageUpload({
    folder: "avatars",
    prefix: "avatar",
    maxSize: 2 * 1024 * 1024
});

// Event image upload configuration
const uploadEventImage = createImageUpload({
    folder: "events",
    prefix: "event",
    maxSize: 3 * 1024 * 1024
});

module.exports = { uploadAvatar, uploadEventImage };
