import  useEventActions from "./useEventActions";

export default function useEventActionsWithConfirm({
    loadData,
    setMessage,
    setError,
    getRoleByEventId,
    confirmLeaveMessage = "Are you sure you want to leave this event?",
  }) {
      const { handleJoinEvent, handleLeaveEvent } = useEventActions({
        loadData,
        setMessage,
        setError,
        getRoleByEventId
      });

    const handleLeaveEventWithConfirm = async (eventId) => {
      const confirmed = window.confirm(confirmLeaveMessage);
      if (!confirmed) return;

      await handleLeaveEvent(eventId);
    };

    return {
      handleJoinEvent,
      handleLeaveEvent: handleLeaveEventWithConfirm,
    };
}