import { getApiPayload } from "../../../api/apiResponse";

import { normalizeEvent } from "../../events/eventNormalizer";

/* ==================================================
   MY EVENT NORMALIZER
   Converts current user event payloads into frontend-friendly data

   Handles:
   - current user events from GET /users/me/events
   - membership role enrichment

   Notes:
   - aligned with authenticated current user event payloads
================================================== */

/* =============================
   CURRENT USER EVENTS
============================= */

// Normalizes one current user event membership item
export const normalizeMyEventItem = (item = {}) => {
    const event = item.event ?? item.Event ?? item;

    return {
        ...normalizeEvent(event),
        role: item.role ?? null,
        membershipId: item.id ?? null,
        membershipCreatedAt: item.createdAt ?? null,
        membershipUpdatedAt: item.updatedAt ?? null
    };
};

// Normalizes current user event items
export const normalizeMyEvents = (items = []) => {
    if (!Array.isArray(items)) return [];

    return items.map(normalizeMyEventItem);
};

// Normalizes a paginated current user event payload
export const normalizePaginatedMyEvents = (payload = {}) => ({
    events: normalizeMyEvents(payload.events),
    page: payload.page ?? 1,
    pageSize: payload.pageSize ?? 10,
    totalEvents: payload.totalEvents ?? 0,
    totalPages: payload.totalPages ?? 1,
    message: payload.message ?? "",
    success: payload.success ?? false
});

// Extracts and normalizes current user events from GET /users/me/events
export const getNormalizedMyEvents = (payload = {}) => {
    const events = getApiPayload(payload, "events");

    return normalizeMyEvents(events);
};
