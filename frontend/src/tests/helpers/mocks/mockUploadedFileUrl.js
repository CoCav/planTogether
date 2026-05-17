/* ==================================================
   UPLOADED FILE URL MOCK HELPERS

   Handles:
   - backend upload paths
   - avatar upload paths
   - event image upload paths
   - external image URLs

   Notes:
   - shared across uploaded file and image utility tests
================================================== */

/* =============================
   BACKEND FILE URLS
============================= */

// Create a backend avatar upload path
export const createMockAvatarPath = (
    filename = "avatar.png"
) => {

    return `/uploads/avatars/${filename}`;
};

// Create a backend event image upload path
export const createMockEventImagePath = (
    filename = "event.jpg"
) => {

    return `/uploads/events/${filename}`;
};

/* =============================
   EXTERNAL URLS
============================= */

// Create an external image URL
export const createMockExternalImageUrl = (
    filename = "image.jpg"
) => {

    return `https://example.com/${filename}`;
};
