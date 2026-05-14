import { getApiPayload } from "../../api/apiResponse";

/* ==================================================
   EVENT NORMALIZER
   Converts backend event payloads into frontend-friendly data

   Handles:
   - single event normalization
   - event list normalization
   - paginated public event payloads
================================================== */

// Normalizes a single event object
export const normalizeEvent = (event = {}) => ({
    id: event.id ?? null,
    title: event.title ?? "",
    description: event.description ?? "",
    theme: event.theme ?? "",
    type: event.type ?? "",
    mode: event.mode ?? "in_person",
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
    status: event.status ?? "upcoming",
    createdAt: event.createdAt ?? null,
    updatedAt: event.updatedAt ?? null
});

// Normalizes an array of events
export const normalizeEvents = (events = []) => {
    if (!Array.isArray(events)) return [];

    return events.map(normalizeEvent);
};

// Normalizes a paginated public event payload
export const normalizePaginatedEvents = (payload = {}) => ({
    events: normalizeEvents(payload.events),
    page: payload.page ?? 1,
    pageSize: payload.pageSize ?? 10,
    totalEvents: payload.totalEvents ?? 0,
    totalPages: payload.totalPages ?? 1,
    message: payload.message ?? "",
    success: payload.success ?? false
});

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
