import defaultEventImage from "../assets/pexels-jrdb99-19683874.jpg";

const API_ORIGIN = import.meta.env.VITE_API_URL.replace("/api", "");

/* ==================================================
   GET EVENT IMAGE
   Provides a helper to resolve the correct event image source

   Handles:
   - default event image fallback when no image is provided
   - external image URLs (http/https)
   - local backend-stored event images (relative paths)

   Ensures that the UI always displays a valid image source
================================================== */

export const getEventImage = (image) => {
    if (!image) return defaultEventImage;

    if (image.startsWith("http")) {
        return image;
    }

    return `${API_ORIGIN}${image}`;
};
