const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =========================
   Ensure upload folder exists
========================= */
const uploadDir = path.join(__dirname, "../../uploads/events");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
   Storage configuration
========================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `event-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    }
});

/* =========================
   File filter
========================= */
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only image files are allowed"), false);
    }

    cb(null, true);
};

/* =========================
   Upload instance
========================= */
const uploadEventImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024
    }
});

module.exports = uploadEventImage;
