import  useEventActions from "./useEventActions";

export default function useEventActionsWithConfirm({
    loadData,
    setMessage,
    setError,
    getRoleByEventId,
  }) {
      const { handleJoinEvent, handleLeaveEvent } = useEventActions({
        loadData,
        setMessage,
        setError,
        getRoleByEventId
      });

    const handleLeaveEventWithConfirm = async (eventId) => {
      const currentRole = getRoleByEventId(eventId);

      const confirmLeaveMessage = currentRole === "co_organizer" ? "Are you sure you want to leave this event? You will lose your co-organizer role and will rejoin later as a participant." : "Are you sure you want to leave this event?";
      const confirmed = window.confirm(confirmLeaveMessage);

      if (!confirmed) return;
      await handleLeaveEvent(eventId);
    };

    return {
      handleJoinEvent,
      handleLeaveEvent: handleLeaveEventWithConfirm,
    };
}