import { useNavigate } from "react-router-dom";
import { deleteEvent } from "../../api/eventApi";
import { updateMemberRole, removeEventMember } from "../../api/eventMembershipApi";

/* ==================================================
   EVENT MANAGEMENT ACTIONS HOOK
   Handles organizer event management actions

   Actions:
   - promote / demote members
   - remove members
   - delete event
   - refresh data after mutations
================================================== */

export default function useEventManagementActions({ eventId, loadData, setMessage, setError }) {
    const navigate = useNavigate();

    /* =========================
       Role management
       Promotes or demotes event members
    ========================= */

    const handlePromote = async (userId) => {
        try {
            setMessage("");
            setError("");

            await updateMemberRole(eventId, userId, "co_organizer");
            setMessage("✅ User promoted to co-organizer");

            await loadData();
        } catch (error) {
            console.error("Error promoting user:", error);
            setError("❌ Unable to promote user");
        }
    };

    const handleDemote = async (userId) => {
        try {
            setMessage("");
            setError("");

            await updateMemberRole(eventId, userId, "participant");
            setMessage("⬇️ User demoted to participant");

            await loadData();
        } catch (error) {
            console.error("Error demoting user:", error);
            setError("❌ Unable to demote user");
        }
    };

    /* =========================
       Member removal
       Removes a member after confirmation
    ========================= */

    const handleRemoveMember = async (userId) => {
        const confirmed = window.confirm("Are you sure you want to remove this member from the event?");

        if (!confirmed) return;

        try {
            setMessage("");
            setError("");

            await removeEventMember(eventId, userId);
            setMessage("🗑️ Member removed successfully");

            await loadData();
        } catch (error) {
            console.error("Error removing member:", error);
            setError("❌ Unable to remove member");
        }
    };

    /* =========================
       Event deletion
       Deletes event after confirmation
    ========================= */

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

    return { handlePromote, handleDemote, handleRemoveMember, handleDeleteEvent };
}
