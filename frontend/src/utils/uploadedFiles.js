import defaultAvatar from "../assets/avatar_user_per_default.png";
import defaultEventImage from "../assets/event_image_per_default.jpg";

const API_ORIGIN = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

/* ==================================================
   UPLOADED FILE UTILS
   Resolves uploaded file URLs with fallback support

   Handles:
   - null/undefined values
   - external URLs
   - backend relative upload paths
   - default avatar and event images
================================================== */

/* =============================
   SHARED HELPERS
============================= */

// Resolves an uploaded file URL with fallback support
export const getUploadedFile = (file, fallback) => {
    if (!file) return fallback;

    if (file.startsWith("http")) {
        return file;
    }

    return `${API_ORIGIN}${file}`;
};

/* =============================
   IMAGE HELPERS
============================= */

// Resolves a user avatar image
export const getAvatar = (avatar) => {
    return getUploadedFile(avatar, defaultAvatar);
};

// Resolves an event image
export const getEventImage = (image) => {
    return getUploadedFile(image, defaultEventImage);
};

export { defaultAvatar, defaultEventImage };
