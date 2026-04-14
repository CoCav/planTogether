import  useEventActions from "./useEventActions";

export default function useEventActionsWithConfirm({
    loadData,
    setMessage,
    setError,
    getRoleByEventId,
    confirmLeaveMessage = "Are you sure you want to leave this event?",
  }) {
      const { handleJoin, handleLeave } = useEventActions({
        loadData,
        setMessage,
        setError,
      getRoleByEventId
      });

    const handleLeaveWithConfirm = async (eventId) => {
      const confirmed = window.confirm(confirmLeaveMessage);
      if (!confirmed) return;

      await handleLeave(eventId);
    };

    return {
      handleJoin,
      handleLeave: handleLeaveWithConfirm,
    };
}