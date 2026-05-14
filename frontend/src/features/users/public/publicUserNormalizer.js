import { getApiPayload } from "../../../api/apiResponse";

/* ==================================================
   PUBLIC USER NORMALIZER
   Converts public user profile payloads into frontend-friendly data

   Handles:
   - public user profile payloads
   - public user profile statistics

   Notes:
   - public user payloads never expose sensitive fields
   - aligned with GET /users/:id
================================================== */

/* =============================
   PUBLIC USER STATS
============================= */

// Normalizes public user profile statistics
export const normalizePublicUserStats = (stats = {}) => ({
    createdEventsCount: Number(stats.createdEventsCount ?? 0),
    joinedEventsCount: Number(stats.joinedEventsCount ?? 0)
});

/* =============================
   PUBLIC USER PROFILE
============================= */

// Normalizes a public user profile payload
export const normalizePublicUserProfile = (payload = {}) => ({
    user: {
        name: payload.user?.name ?? "",
        avatar: payload.user?.avatar ?? null
    },

    stats: normalizePublicUserStats(payload.stats),

    message: payload.message ?? "",
    success: payload.success ?? false
});

// Extracts and normalizes public user profile from GET /users/:id
export const getNormalizedPublicUserProfile = (payload = {}) => {
    return normalizePublicUserProfile({
        user: getApiPayload(payload, "user"),
        stats: getApiPayload(payload, "stats"),
        message: payload.message,
        success: payload.success
    });
};
