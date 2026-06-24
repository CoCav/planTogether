import { getApiErrorMessage } from "../../../api/apiError";
import { joinEvent, leaveEvent } from "../../../api/eventMemberships/eventMembershipApi";

import { EVENT_ROLES } from "../../shared/constants/eventRoles";

/* ==================================================
   MEMBERSHIP ACTIONS HOOK
   Handles current user event membership actions

   Actions:
   - join event
   - leave event
   - refresh data after success

   Notes:
   - accepts direct current user role for single event pages
   - accepts event role lookup for event listing pages
   - uses toast feedback for temporary action messages
   - window.confirm is kept for leave confirmation
================================================== */

export default function useMembershipActions({
    loadData,
    toast,
    currentUserRole = null,
    getCurrentUserRoleByEvent = () => null
}) {

    /* =============================
       ROLE RESOLUTION
    ============================= */

    // Gets current user's role from direct role or listing lookup
    const getCurrentUserRole = (eventId) => {
        if (currentUserRole) {
            return currentUserRole;
        }

        return getCurrentUserRoleByEvent(eventId);
    };

    /* =============================
       JOIN EVENT
    ============================= */

    // Joins an event as participant
    const handleJoinEvent = async (eventId) => {
        try {
            await joinEvent(eventId);

            toast.success("Joined event.");

            await loadData();

        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to join event"));
        }
    };

    /* =============================
       LEAVE EVENT
    ============================= */

    // Leaves an event after confirmation
    const handleLeaveEvent = async (eventId) => {
        const currentRole = getCurrentUserRole(eventId);

        // Prevents organizers from leaving their own event
        if (currentRole === EVENT_ROLES.ORGANIZER) {
            toast.danger("Organizer cannot leave their own event");
            return;
        }

        // Warns co-organizers about losing elevated permissions
        const confirmLeaveMessage =
            currentRole === EVENT_ROLES.CO_ORGANIZER
                ? "Are you sure you want to leave this event? You will lose your co-organizer role and will rejoin later as a participant."
                : "Are you sure you want to leave this event?";

        const confirmed = window.confirm(confirmLeaveMessage);

        if (!confirmed) return;

        try {
            await leaveEvent(eventId);

            toast.success("Left event.");

            await loadData();

        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to leave event"));
        }
    };

    return {
        handleJoinEvent,
        handleLeaveEvent
    };
}
