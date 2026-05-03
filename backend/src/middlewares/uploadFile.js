const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ==================================================
   UPLOAD FILE MIDDLEWARE
   Creates reusable multer upload handlers for file (avatar/event image)
================================================== */

const createImageUpload = ({ folder, prefix, maxSize }) => {
    const uploadDir = path.join(__dirname, "../../uploads", folder);

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
            return cb(new Error("Only image files are allowed"), false);
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
