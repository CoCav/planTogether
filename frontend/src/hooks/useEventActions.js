import { joinEvent, leaveEvent } from "../api/eventApi";

export default function useEventActions({
    loadData,
    setMessage,
    setError,
    getRoleByEventId

    }) {

        const handleJoin = async (eventId) => {

            try {
                setError("");
                setMessage("");

                await joinEvent(eventId);
                setMessage("✅ Successfully Joined event !");
                await loadData();

            } catch (error) {
                console.error("Error joining event:", error);
                setError("❌ Unable to join event");
            }
        };

        const handleLeave = async (eventId) => {

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

    return { handleJoin, handleLeave };
}