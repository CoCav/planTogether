/* ==================================================
   EVENT ACTIONS HOOK
   --------------------------------------------------
   Centralizes basic event membership actions.

   This hook handles:
   - Joining an event
   - Leaving an event

   It ensures:
   - Consistent feedback messages
   - Consistent error handling
   - Data refresh after each successful action

   Goal:
   Execute event membership actions while keeping
   pages/components free of API side-effects.
================================================== */

import { joinEvent, leaveEvent } from "../../api/eventMembershipApi";

export default function useEventActions({ loadData, setMessage, setError, getRoleByEventId }) {

    /* =========================
     Join event handler
        Adds the current user as a participant
        and refreshes event data
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
     Leave event handler
        Removes the current user from the event,
        unless they are the main organizer
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

    return {handleJoinEvent,  handleLeaveEvent};
}