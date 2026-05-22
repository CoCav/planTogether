import { EVENT_ROLES } from "../shared/eventRoles";

/* ==================================================
   EVENT MEMBERSHIP ROLES
   Shared helpers for event membership role handling

   Handles:
   - membership role map creation
   - current user role resolution for event listings

   Notes:
   - used by event listing and preview pages
   - optimized for lightweight event card role lookup
================================================== */

// Converts membership event list into eventId -> role map
export const buildMembershipMap = (membershipEvents = []) => {
    const membershipMap = {};

    membershipEvents.forEach((item) => {
        if (!item?.id) return;

        membershipMap[item.id] = item.role;
    });

    return membershipMap;
};

// Resolves current user's membership role for a given event
export const getCurrentUserEventRole = ({
    eventId,
    events = [],
    membershipMap = {},
    user
}) => {
    const event = events.find((item) => item.id === eventId);

    if (!user || !event) {
        return null;
    }

    if (event.creatorId === user.userId) {
        return EVENT_ROLES.ORGANIZER;
    }

    return membershipMap[eventId] || null;
};
