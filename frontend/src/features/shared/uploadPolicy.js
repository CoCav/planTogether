/* ==================================================
   UPLOAD POLICY
   Provides frontend upload validation helpers

   Handles:
   - allowed image MIME types
   - avatar size limit
   - event image size limit
   - reusable file validation messages

   Notes:
   - mirrors backend upload security policy for UX validation
   - backend remains the source of truth for upload security
================================================== */

export const ALLOWED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];

export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
export const MAX_EVENT_IMAGE_SIZE = 3 * 1024 * 1024;

// Validates an uploaded image file
export const validateImageFile = ({
    file,
    maxSize,
    label = "Image"
}) => {
    if (!file) return null;

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
        return `${label} must be an image file`;
    }

    if (file.size > maxSize) {
        return `${label} must be less than ${maxSize / 1024 / 1024}MB`;
    }

    return null;
};

// Validates an uploaded avatar file
export const validateAvatarFile = (file) => {
    return validateImageFile({
        file,
        maxSize: MAX_AVATAR_SIZE,
        label: "Avatar"
    });
};

// Validates an uploaded event image file
export const validateEventImageFile = (file) => {
    return validateImageFile({
        file,
        maxSize: MAX_EVENT_IMAGE_SIZE,
        label: "Event image"
    });
};
