import { getApiPayload } from "../../api/apiResponse";
import { normalizeAuthenticatedUser } from "../users/authenticated/myUserNormalizer";

/* ==================================================
   AUTH NORMALIZER
   Converts backend auth payloads into frontend-friendly data

   Handles:
   - register response
   - login response
   - authenticated user payload
   - authentication token payload

   Notes:
   - aligned with authController register/login responses
   - user profile normalization belongs to features/users
================================================== */

/* =============================
   AUTH PAYLOAD
============================= */

// Normalizes auth response payload from register/login
export const normalizeAuthPayload = (payload = {}) => ({
    user: normalizeAuthenticatedUser(getApiPayload(payload, "user")),
    token: getApiPayload(payload, "token"),
    message: payload.message ?? "",
    success: payload.success ?? false
});

// Extracts and normalizes auth payload from API response
export const getNormalizedAuthPayload = (payload = {}) => {
    return normalizeAuthPayload(payload);
};
