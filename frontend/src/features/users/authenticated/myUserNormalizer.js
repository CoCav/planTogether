import { getApiPayload } from "../../../api/apiResponse";

/* ==================================================
   MY USER NORMALIZER
   Converts authenticated user profile payloads into frontend-friendly data

   Handles:
   - authenticated user profile payloads
   - updated authenticated user profile payloads

   Notes:
   - authenticated user payloads may expose email
   - aligned with GET /users/me and PUT /users/me
================================================== */

// Normalizes an authenticated user profile
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
