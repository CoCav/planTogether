import { joinEvent, leaveEvent } from "../../../api/events/eventMembershipApi";

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
    // Joins an event as participant
    const handleJoinEvent = async (eventId) => {
        try {
            setError("");
            setMessage("");

            await joinEvent(eventId);

            setMessage("✅ Successfully joined event!");

            await loadData();
        } catch (error) {
            console.error("Error joining event:", error);
            setError("❌ Unable to join event");
        }
    };

    // Leaves an event after confirmation
    const handleLeaveEvent = async (eventId) => {
        const currentRole = getRoleByEventId(eventId);

        if (currentRole === "organizer") {
            setError("❌ Organizer cannot leave their own event");
            return;
        }

        const confirmLeaveMessage =
            currentRole === "co_organizer"
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
            console.error("Error leaving event:", error);
            setError("❌ Unable to leave event");
        }
    };

    return {
        handleJoinEvent,
        handleLeaveEvent
    };
}
