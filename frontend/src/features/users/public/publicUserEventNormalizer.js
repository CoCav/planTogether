import { normalizeEvents } from "../../events/eventNormalizer";

/* ==================================================
   PUBLIC USER EVENT NORMALIZER
   Converts public user event payloads into frontend-friendly data

   Handles:
   - paginated public user events from GET /users/:id/events
   - public user event pagination metadata

   Notes:
   - aligned with view-based public user event payloads
================================================== */

/* =============================
   PUBLIC USER EVENTS
============================= */

// Normalizes public user paginated event payload
export const normalizePublicUserEvents = (payload = {}) => ({
    view: payload.view ?? "created",
    page: Number(payload.page ?? 1),
    pageSize: Number(payload.pageSize ?? 4),
    totalEvents: Number(payload.totalEvents ?? 0),
    totalPages: Number(payload.totalPages ?? 1),
    events: normalizeEvents(payload.events),

    message: payload.message ?? "",
    success: payload.success ?? false
});

// Extracts and normalizes public user events from GET /users/:id/events
export const getNormalizedPublicUserEvents = (payload = {}) => {
    return normalizePublicUserEvents(payload);
};
