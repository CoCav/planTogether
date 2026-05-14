import { getApiPayload } from "../../../api/apiResponse";

import { normalizeEvents } from "../../events/eventNormalizer";

/* ==================================================
   PUBLIC USER EVENT NORMALIZER
   Converts public user event payloads into frontend-friendly data

   Handles:
   - public user events from GET /users/:id/events

   Notes:
   - aligned with public user event payloads
================================================== */

/* =============================
   PUBLIC USER EVENTS
============================= */

// Normalizes public user event payload
export const normalizePublicUserEvents = (payload = {}) => ({
    createdEvents: normalizeEvents(payload.createdEvents),
    joinedEvents: normalizeEvents(payload.joinedEvents),
    message: payload.message ?? "",
    success: payload.success ?? false
});

// Extracts and normalizes public user created/joined events
export const getNormalizedPublicUserEvents = (payload = {}) => ({
    createdEvents: normalizeEvents(getApiPayload(payload, "createdEvents")),
    joinedEvents: normalizeEvents(getApiPayload(payload, "joinedEvents"))
});
