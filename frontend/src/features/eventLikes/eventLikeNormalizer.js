/* ==================================================
   EVENT LIKE NORMALIZER
   Converts backend event like payloads into frontend-friendly data

   Handles:
   - like state normalization
   - likes count normalization
   - event ID and user ID normalization

   Notes:
   - like and unlike responses share the same response shape
   - liked is controlled by backend response
================================================== */

// Normalizes event like mutation response
export const normalizeEventLike = (payload = {}) => ({
    eventId: payload.eventId ?? null,
    userId: payload.userId ?? null,
    liked: Boolean(payload.liked),
    likesCount: Number(payload.likesCount ?? 0)
});
