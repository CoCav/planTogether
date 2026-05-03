// utils/getUploadedFile.js
import defaultAvatar from "../assets/avatar_user_per_default.png";
import defaultEventImage from "../assets/pexels-jrdb99-19683874.jpg";

const API_ORIGIN = import.meta.env.VITE_API_URL.replace("/api", "");

/* ==================================================
   GET UPLOADED FILE
   Resolves image sources (avatar, event, etc.) with fallback

   Handles:
   - null/undefined → fallback
   - external URLs (http/https)
   - backend relative paths (/uploads/...)
================================================== */

export const getUploadedFile = (file, fallback) => {
    if (!file) return fallback;

    if (file.startsWith("http")) {
        return file;
    }

    return `${API_ORIGIN}${file}`;
};

/* =========================
   Specific helpers
========================= */

export const getAvatar = (avatar) => getUploadedFile(avatar, defaultAvatar);

export const getEventImage = (image) => getUploadedFile(image, defaultEventImage);

export { defaultAvatar, defaultEventImage };
