import apiClient from "../apiClient";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   EVENT MEMBERSHIP API
   Handles event membership and role management requests

   Routes:
   - POST /events/:eventId/members/join
   - DELETE /events/:eventId/members/leave
   - GET /events/:eventId/members
   - GET /events/:eventId/staff
   - PUT /events/:eventId/members/:userId/role
   - DELETE /events/:eventId/members/:userId
   - PUT /events/:eventId/ownership

   Notes:
   - current user events belong to userApi.js through /users/me/events
   - protected routes are handled by the backend
   - role and ownership authorization are handled by the backend
================================================== */

/* =============================
   JOIN / LEAVE EVENTS
============================= */

// Joins an event
export const joinEvent = async (eventId) => {
    const response = await apiClient.post(`/events/${eventId}/members/join`);
    return unwrapApiResponse(response);
};

// Leaves an event
export const leaveEvent = async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}/members/leave`);
    return unwrapApiResponse(response);
};

/* =============================
   MEMBERS / STAFF
============================= */

// Fetches all members of an event
export const getEventMembers = async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/members`);
    return unwrapApiResponse(response);
};

// Fetches organizers and co-organizers of an event
export const getEventStaff = async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/staff`);
    return unwrapApiResponse(response);
};

/* =============================
   ROLE / OWNERSHIP MANAGEMENT
============================= */

// Updates a member role
export const updateEventMemberRole = async (eventId, userId, newRole) => {
    const response = await apiClient.put(`/events/${eventId}/members/${userId}/role`, {
        newRole
    });

    return unwrapApiResponse(response);
};
// Removes a member from an event
export const removeEventMember = async (eventId, userId) => {
    const response = await apiClient.delete(`/events/${eventId}/members/${userId}`);
    return unwrapApiResponse(response);
};

// Transfers event ownership to another member
export const transferEventOwnership = async (eventId, targetUserId) => {
    const response = await apiClient.put(`/events/${eventId}/ownership`, {
        targetUserId
    });

    return unwrapApiResponse(response);
};
