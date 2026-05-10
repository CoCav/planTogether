/* ==================================================
   UPLOAD SECURITY POLICY

   Handles:
   - allowed image MIME types
   - allowed image file extensions
   - upload size limits

   Notes:
   - shared by upload middlewares
   - keeps upload security rules centralized
================================================== */

const ALLOWED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];

const ALLOWED_IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif"
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MAX_EVENT_IMAGE_SIZE = 3 * 1024 * 1024;

module.exports = {
    ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_AVATAR_SIZE,
    MAX_EVENT_IMAGE_SIZE
};
