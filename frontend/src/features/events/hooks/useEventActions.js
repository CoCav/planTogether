import { useNavigate } from "react-router-dom";

import { deleteEvent } from "../../../api/events/eventApi";

/* ==================================================
   EVENT ACTIONS HOOK
   Handles organizer event actions

   Actions:
   - delete event

   Notes:
   - membership actions belong to eventMemberships
================================================== */

export default function useEventActions({
    eventId,
    setMessage,
    setError
}) {
    const navigate = useNavigate();

    // Deletes an event after confirmation
    const handleDeleteEvent = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this event?");

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await deleteEvent(eventId);

            navigate("/events");
        } catch (error) {
            console.error("Error deleting event:", error);
            setError("❌ Unable to delete event");
        }
    };

    return {
        handleDeleteEvent
    };
}
