import { getApiErrorMessage } from "../../../api/apiError";
import { joinEvent, leaveEvent } from "../../../api/events/eventMembershipApi";

import { EVENT_ROLES } from "../../shared/eventRoles";

/* ==================================================
   MEMBERSHIP ACTIONS HOOK
   Handles current user event membership actions

   Actions:
   - join event
   - leave event
   - refresh data after success
================================================== */

export default function useMembershipActions({
    loadData,
    setMessage,
    setError,
    getRoleByEventId
}) {

    /* =============================
       JOIN EVENT
    ============================= */

    // Joins an event as participant
    const handleJoinEvent = async (eventId) => {
        try {
            setError("");
            setMessage("");

            await joinEvent(eventId);

            setMessage("✅ Successfully joined event!");

            await loadData();
        } catch (error) {
            setError(getApiErrorMessage(error, "❌ Unable to join event"));
        }
    };

    /* =============================
       LEAVE EVENT
    ============================= */

    // Leaves an event after confirmation
    const handleLeaveEvent = async (eventId) => {
        const currentRole = getRoleByEventId(eventId);

        if (currentRole === EVENT_ROLES.ORGANIZER) {
            setError("❌ Organizer cannot leave their own event");
            return;
        }

        const confirmLeaveMessage =
            currentRole === EVENT_ROLES.CO_ORGANIZER
                ? "Are you sure you want to leave this event? You will lose your co-organizer role and will rejoin later as a participant."
                : "Are you sure you want to leave this event?";

        const confirmed = window.confirm(confirmLeaveMessage);

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await leaveEvent(eventId);

            setMessage("👋 Successfully left event");

            await loadData();
        } catch (error) {
            setError(getApiErrorMessage(error, "❌ Unable to leave event"));
        }
    };

    return {
        handleJoinEvent,
        handleLeaveEvent
    };
}
