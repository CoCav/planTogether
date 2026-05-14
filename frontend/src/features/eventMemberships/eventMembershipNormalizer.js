import { getApiPayload } from "../../api/apiResponse";

/* ==================================================
   EVENT MEMBERSHIP NORMALIZER
   Converts backend membership payloads into frontend-friendly data

   Handles:
   - event members
   - event staff
   - membership role data
   - ownership transfer result
================================================== */

/* =============================
   MEMBERSHIP NORMALIZATION
============================= */

// Normalizes one membership item
export const normalizeMembership = (membership = {}) => {
    const user = membership.User ?? membership.user ?? {};

    return {
        id: membership.id ?? null,
        eventId: membership.eventId ?? null,
        userId: membership.userId ?? user.id ?? null,
        role: membership.role ?? null,

        joinedAt: membership.joinedAt ?? null,
        createdAt: membership.createdAt ?? null,
        updatedAt: membership.updatedAt ?? null,
        deletedAt: membership.deletedAt ?? null,

        user: {
            id: user.id ?? membership.userId ?? null,
            name: user.name ?? "",
            email: user.email ?? ""
        }
    };
};

// Normalizes an array of membership items
export const normalizeMemberships = (memberships = []) => {
    if (!Array.isArray(memberships)) return [];

    return memberships.map(normalizeMembership);
};

/* =============================
   MEMBER / STAFF LISTS
============================= */

// Normalizes membership data for member/staff UI lists
export const normalizeMemberList = (memberships = []) => {
    return normalizeMemberships(memberships).map((membership) => ({
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,

        role: membership.role,

        membershipId: membership.id,
        eventId: membership.eventId,

        joinedAt: membership.joinedAt,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
        deletedAt: membership.deletedAt
    }));
};

// Extracts and normalizes members from GET /events/:eventId/members
export const getNormalizedMembers = (payload = {}) => {
    const members = getApiPayload(payload, "members");

    return normalizeMemberList(members);
};

// Extracts and normalizes staff from GET /events/:eventId/staff
export const getNormalizedEventStaff = (payload = {}) => {
    const eventStaff = getApiPayload(payload, "eventStaff");

    return normalizeMemberList(eventStaff);
};

/* =============================
   SINGLE MEMBERSHIP
============================= */

// Extracts and normalizes one membership from join/update role responses
export const getNormalizedMembership = (payload = {}) => {
    const membership = getApiPayload(payload, "membership");

    return normalizeMembership(membership);
};

/* =============================
   OWNERSHIP TRANSFER
============================= */

// Extracts and normalizes ownership transfer result
export const getNormalizedOwnershipTransfer = (payload = {}) => {
    const data = getApiPayload(payload, "data");

    return {
        previousOrganizer: normalizeMembership(data?.previousOrganizer),
        newOrganizer: normalizeMembership(data?.newOrganizer)
    };
};
