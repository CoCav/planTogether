import { getPaginatedPayload } from "../../../api/apiResponse";

import { normalizeEvents } from "../../events/eventNormalizer";

/* ==================================================
   PUBLIC USER EVENT NORMALIZER
   Converts public user event payloads into frontend-friendly data

   Handles:
   - public user events from GET /users/:id/events
   - paginated public user event payloads
   - public user event pagination metadata

   Notes:
   - aligned with view-based public user event payloads
   - public user event items are plain event payloads
================================================== */

/* =============================
   PUBLIC USER EVENTS
============================= */

// Normalizes public user event items
export const normalizePublicUserEvents = (items = []) => {
    return normalizeEvents(items);
};

// Normalizes a paginated public user event payload
export const normalizePaginatedPublicUserEvents = (payload = {}) => {
    const { items, pagination, message, success } = getPaginatedPayload(payload, "events");

    return {
        view: payload.view ?? "created",
        events: normalizePublicUserEvents(items),
        page: Number(pagination.page),
        pageSize: Number(pagination.pageSize ?? 4),
        totalEvents: Number(pagination.totalItems),
        totalPages: Number(pagination.totalPages),
        message,
        success
    };
};

// Extracts and normalizes public user events from GET /users/:id/events
export const getNormalizedPublicUserEvents = (payload = {}) => {
    return normalizePaginatedPublicUserEvents(payload);
};
