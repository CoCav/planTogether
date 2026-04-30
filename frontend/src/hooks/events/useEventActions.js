import { joinEvent, leaveEvent } from "../../api/eventMembershipApi";

/* ==================================================
   EVENT ACTIONS HOOK
   Handles basic event membership actions

   Actions:
   - join event
   - leave event
   - refresh data after success
================================================== */

export default function useEventActions({ loadData, setMessage, setError, getRoleByEventId }) {
    /* =========================
       Join event
       Adds current user as participant
    ========================= */

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

    /* =========================
       Leave event
       Removes current user unless they are organizer
    ========================= */

    const handleLeaveEvent = async (eventId) => {
        try {
            setError("");
            setMessage("");

            const role = getRoleByEventId(eventId);

            if (role === "organizer") {
                setError("❌ Organizer cannot leave their own event");
                return;
            }

            await leaveEvent(eventId);
            setMessage("👋 Successfully left event");

            await loadData();
        } catch (error) {
            console.error("Error leaving event:", error);
            setError("❌ Unable to leave event");
        }
    };

    return { handleJoinEvent, handleLeaveEvent };
}
