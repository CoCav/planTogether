import { getApiPayload } from "../../api/apiResponse";

/* ==================================================
   USER NORMALIZER
   Converts backend user profile payloads into frontend-friendly data

   Handles:
   - authenticated user profile
   - updated authenticated user profile
   - public user profile
   - public user profile stats

   Notes:
   - authenticated users expose email
   - public users do not expose sensitive fields
   - aligned with userController and userFormatter
================================================== */

/* =============================
   AUTHENTICATED USER
============================= */

// Normalizes the authenticated user profile
export const normalizeAuthenticatedUser = (user = {}) => ({
    userId: user.userId ?? user.id ?? null,
    name: user.name ?? "",
    email: user.email ?? "",
    avatar: user.avatar ?? null
});

// Extracts and normalizes authenticated user from GET /users/me or PUT /users/me
export const getNormalizedAuthenticatedUser = (payload = {}) => {
    const user = getApiPayload(payload, "user");

    return normalizeAuthenticatedUser(user);
};

/* =============================
   PUBLIC USER
============================= */

// Normalizes public user profile stats
export const normalizePublicUserStats = (stats = {}) => ({
    createdEventsCount: Number(stats.createdEventsCount ?? 0),
    joinedEventsCount: Number(stats.joinedEventsCount ?? 0)
});

// Normalizes public user profile
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
