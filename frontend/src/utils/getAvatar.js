import defaultAvatar from "../assets/avatar_user_per_default.png";

const API_ORIGIN = import.meta.env.VITE_API_URL.replace("/api", "");

/* ==================================================
   GET AVATAR
   Provides a helper to resolve the correct avatar source

   Handles:
   - default avatar fallback when no avatar is provided
   - external avatar URLs (http/https)
   - local backend-stored avatars (relative paths)

   Ensures that the UI always displays a valid image source
================================================== */

export const getAvatar = (avatar) => {
    // If no avatar is provided → return default image
    if (!avatar) return defaultAvatar;

    // If avatar is already a full URL → return as is
    if (avatar.startsWith("http")) {
        return avatar;
    }

    // Otherwise → assume it's a backend path and prepend API URL
    return `${API_ORIGIN}${avatar}`;
};
