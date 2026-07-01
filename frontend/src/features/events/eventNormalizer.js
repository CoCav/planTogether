import { getApiPayload, getPaginatedPayload } from "../../api/apiResponse";

import { EVENT_STATUS } from "../shared/constants/eventStatus";
import { EVENT_MODES } from "../shared/constants/eventModes";

/* ==================================================
   EVENT NORMALIZER
   Converts backend event payloads into frontend-friendly data

   Handles:
   - single event normalization
   - event list normalization
   - paginated public event payloads
   - participant count normalization
   - review stats normalization
   - like count normalization
   - current user like state normalization

   Notes:
   - like metadata is normalized for event cards and details pages
================================================== */

/* =============================
   SINGLE EVENT
============================= */

// Normalizes a single event object
export const normalizeEvent = (event = {}) => ({
    id: event.id ?? null,
    title: event.title ?? "",
    description: event.description ?? "",

    theme: event.theme ?? "",
    type: event.type ?? "",

    mode: event.mode ?? EVENT_MODES.IN_PERSON,
    location: event.location ?? "",

    startDateTime: event.startDateTime ?? null,
    endDateTime: event.endDateTime ?? null,

    creatorId: event.creatorId ?? null,
    creatorName: event.creator?.name ?? event.creatorName ?? "",

    image: event.image ?? null,
    maxParticipants:
        event.maxParticipants === null || event.maxParticipants === undefined
            ? null
            : Number(event.maxParticipants),

    registrationDeadline: event.registrationDeadline ?? null,
    participantCount: Number(event.participantCount ?? 0),

    likesCount: Number(event.likesCount ?? 0),

    isLikedByCurrentUser: Boolean(event.isLikedByCurrentUser),

    reviewCount: Number(event.reviewCount ?? 0),
    averageRating: event.averageRating === null || event.averageRating === undefined
        ? null
        : Number(event.averageRating),

    status: event.status ?? EVENT_STATUS.UPCOMING,

    createdAt: event.createdAt ?? null,
    updatedAt: event.updatedAt ?? null
});


/* =============================
   EVENT LISTS
============================= */

// Normalizes an array of events
export const normalizeEvents = (events = []) => {
    if (!Array.isArray(events)) return [];

    return events.map(normalizeEvent);
};

// Normalizes a paginated public event payload
export const normalizePaginatedEvents = (payload = {}) => {
    const { items, pagination, message, success } = getPaginatedPayload(payload, "events");

    return {
        events: normalizeEvents(items),
        page: pagination.page,
        pageSize: pagination.pageSize ?? 10,
        totalEvents: pagination.totalItems,
        totalPages: pagination.totalPages,
        message,
        success
    };
};

// Extracts and normalizes events from GET /events
export const getNormalizedEvents = (payload = {}) => {
    const events = getApiPayload(payload, "events");

    return normalizeEvents(events);
};

// Extracts and normalizes one event from GET /events/:eventId
export const getNormalizedEvent = (payload = {}) => {
    const event = getApiPayload(payload, "event");

    return normalizeEvent(event);
};
