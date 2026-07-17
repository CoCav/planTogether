/* ==========================================================================
   Upload Security Policy

   Defines shared upload security rules.

   Responsibilities
   - Define allowed image MIME types
   - Define allowed image file extensions
   - Define valid MIME type and extension pairs
   - Define upload size limits

   Notes
   - Shared by upload middlewares.
   - Keep these rules synchronized with frontend upload validation.
=========================================================================== */

/* =============================
   IMAGE TYPE POLICY
============================= */

// Allowed image MIME types for each file extension
const IMAGE_TYPE_POLICY = {
    ".jpg": [
        "image/jpeg"
    ],
    ".jpeg": [
        "image/jpeg"
    ],
    ".png": [
        "image/png"
    ],
    ".webp": [
        "image/webp"
    ],
    ".gif": [
        "image/gif"
    ]
};

/* =============================
   ALLOWED IMAGE TYPES
============================= */

// Supported image extensions
const ALLOWED_IMAGE_EXTENSIONS = Object.keys(IMAGE_TYPE_POLICY);

// Supported image MIME types
const ALLOWED_IMAGE_MIME_TYPES = Array.from(
    new Set(Object.values(IMAGE_TYPE_POLICY).flat())
);

/* =============================
   UPLOAD SIZE LIMITS
============================= */

// Maximum avatar upload size (2 MB)
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

// Maximum event image upload size (3 MB)
const MAX_EVENT_IMAGE_SIZE = 3 * 1024 * 1024;

module.exports = {
    IMAGE_TYPE_POLICY,
    ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_AVATAR_SIZE,
    MAX_EVENT_IMAGE_SIZE
};
