import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../../../../api/apiError";
import { deleteEvent } from "../../../../api/events/eventApi";

/* ==================================================
   EVENT ACTIONS HOOK
   Handles organizer event actions

   Actions:
   - destructive event deletion confirmation
   - delete event request
   - post-deletion redirect
   - delete error feedback

   Notes:
   - membership actions belong to eventMemberships
   - uses toast feedback for temporary action errors
   - window.confirm is kept for delete confirmation
================================================== */

export default function useEventActions({ eventId, toast }) {

    // Redirects user after successful deletion
    const navigate = useNavigate();

    /* =============================
       EVENT DELETION
    ============================= */

    // Deletes an event after confirmation
    const handleDeleteEvent = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this event? This action cannot be undone and will remove the event for all participants."
        );

        if (!confirmed) return;

        try {
            await deleteEvent(eventId);

            navigate("/events");
        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to delete event"));
        }
    };

    return {
        handleDeleteEvent
    };
}
