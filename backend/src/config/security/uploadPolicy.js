/* ==========================================================================
   Upload Security Policy

   Defines shared upload security rules.

   Responsibilities
   - Define allowed image MIME types
   - Define allowed image file extensions
   - Define upload size limits

   Notes
   - Shared by upload middlewares.
   - Keep these rules synchronized with frontend upload validation.
=========================================================================== */

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
