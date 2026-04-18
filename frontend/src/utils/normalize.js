/* 
This file is responsible for:
 * - simplifying API (Axios) responses
 * - standardizing data used in the frontend
 * - avoiding complex logic inside React components
 */

// Extracts useful data from API response, handling different possible structures
export const extractApiData = (response = {}, key = "") => {
  if (!response || !response.data) return [];

  // If a specific key exists (e.g. events, members, organizers)
  if (key && response.data[key]) {
    return response.data[key];
  }

  return response.data;
};

// Normalizes s single event object
// Ensures that all expected fields are present with default values
export const normalizeEvent = (event = {}) => ({
    id: event.id,
    title: event.title || "",
    description: event.description || "",
    date: event.date || null,
    location: event.location || "",
    theme: event.theme || "",
    type: event.type || "",
    creatorId: event.creatorId || null,
    creatorName: event.creator?.name || "",
    createdAt: event.createdAt || null,
    updatedAt: event.updatedAt || null,
});

// Normalizes an array of events
export const normalizeEvents = (events) => events.map(normalizeEvent);

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