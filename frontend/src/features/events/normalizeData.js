/* ==================================================
   DATA NORMALIZATION
   Transforms backend data into frontend-friendly format
================================================== */

import { extractApiData } from "../../utils/extractApiData";

// Normalizes a single event object
// Ensures that all expected fields are present with default values
export const normalizeEvent = (event = {}) => ({
    id: event.id,
    title: event.title || "",
    description: event.description || "",
    theme: event.theme || "",
    type: event.type || "",
    mode: event.mode || "in_person",
    location: event.location || "",
    startDateTime: event.startDateTime || null,
    endDateTime: event.endDateTime || null,
    creatorId: event.creatorId || null,
    creatorName: event.creator?.name || "", 
    maxParticipants: event.maxParticipants === null || event.maxParticipants === undefined ? null : Number(event.maxParticipants),
    registrationDeadline: event.registrationDeadline || null,
    participantCount: Number(event.participantCount) || 0,
    status: event.status || "upcoming",
    createdAt: event.createdAt || null,
    updatedAt: event.updatedAt || null,
});

// Normalizes an array of events
export const normalizeEvents = (events = []) => Array.isArray(events) ? events.map(normalizeEvent) : [];

// Normalizes user-role data (members / organizers) 
export const normalizeUserRoleData = (items = []) =>
    items.map((item) => ({
        id: item.User.id,
        name: item.User.name,
        email: item.User.email,
        role: item.role,
    })
);

// Extracts and normalizes events from a response like GET /events or GET /events/filtered
export const getNormalizedEvents = (response = {}) => normalizeEvents(extractApiData(response, "events"));

// Extracts and normalizes events related to the current user (includes role(s))
export const getMyEventsWithRole = (response = {}) => {
  const items = response.data.events || [];
  return items.map((item) => {
    const event = normalizeEvent(item.Event || item);

    return {
        ...event,
        role: item.role || "participant",
    };
  });
}
// Extracts and normalizes a single event from a response like GET /events/:id
export const getNormalizedEvent = (response = {}) => normalizeEvent(extractApiData(response, "event"));

// Extracts and normalizes organizers from a response like GET /events/:id/organizers
export const getNormalizedOrganizers = (response = {}) => normalizeUserRoleData(extractApiData(response, "organizers"));

// Extracts and normalizes members from a response like GET /events/:id/members
export const getNormalizedMembers = (response = {}) => normalizeUserRoleData(extractApiData(response, "members"));