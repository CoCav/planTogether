/* ==================================================
   EVENT ACTIONS WITH CONFIRM HOOK
   --------------------------------------------------
   Wraps basic event membership actions with
   confirmation logic when needed.

   This hook handles:
   - Reusing join / leave actions from useEventActions
   - Asking confirmation before leaving an event
   - Showing a specific warning for co-organizers

   Goal:
   Add confirmation UX on top of existing actions
   without duplicating business logic.
================================================== */

import useEventActions from "./useEventActions";

export default function useEventActionsWithConfirm({ loadData, setMessage, setError, getRoleByEventId}) {

	// Base membership actions: Reuses shared join / leave logic
    const { handleJoinEvent, handleLeaveEvent } = useEventActions({loadData, setMessage, setError, getRoleByEventId });


    /* ==========================================
     Leave confirmation handler
        Confirms before leaving the event.
        Co-organizers receive a stronger warning because they lose their role.
    ============================================= */

    const handleLeaveEventWithConfirm = async (eventId) => {
        const currentRole = getRoleByEventId(eventId);

        const confirmLeaveMessage = currentRole === "co_organizer"
                ? "Are you sure you want to leave this event? You will lose your co-organizer role and will rejoin later as a participant."
                : "Are you sure you want to leave this event?";

        const confirmed = window.confirm(confirmLeaveMessage);

        if (!confirmed) return;

        await handleLeaveEvent(eventId);
    };

    return {handleJoinEvent, handleLeaveEvent: handleLeaveEventWithConfirm};
}