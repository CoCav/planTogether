import { useNavigate } from "react-router-dom";
import { deleteEvent } from "../api/eventApi";
import {updateMemberRole, removeEventMember} from "../api/eventMembershipApi";

/* ==================================================
   EVENT MANAGEMENT ACTIONS HOOK
   --------------------------------------------------
   Centralizes all event management operations that
   modify event data or membership roles.

   This hook handles:
   - Promoting a participant to co-organizer
   - Demoting a co-organizer to participant
   - Removing a member from the event
   - Deleting the event

   It ensures:
   - Consistent error handling
   - User feedback via messages
   - Data refresh after each action

   Goal:
   Keep pages/components clean by extracting API
   side-effects and mutation logic into one place.
================================================== */

export default function useEventManagementActions({eventId, loadData, setMessage, setError }) {
    const navigate = useNavigate();

    /* =========================
     Promote handler
        Upgrades a participant to co-organizer
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

    /* =========================
     Demote handler
        Downgrades a co-organizer to participant
    ========================= */

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
     Remove member handler
        Removes a user from the event after confirmation
    ========================= */

    const handleRemoveMember = async (userId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this member from the event?"
        );

        if (!confirmed) return;

        try {
            setMessage("");
            setError("");

            await removeEventMember(eventId, userId);
            setMessage("🗑️ Member removed successfully");

            // Refresh event data to update member list
            await loadData();

        } catch (error) {
            console.error("Error removing member:", error);
            setError("❌ Unable to remove member");
        }
    };

    /* =========================
     Delete event handler
        Permanently deletes the event after confirmation
    ========================= */

    const handleDeleteEvent = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this event?"
        );

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

    return { handlePromote, handleDemote, handleRemoveMember, handleDeleteEvent};
}