import { removeEventMember, transferEventOwnership, updateEventMemberRole } from "../../../api/events/eventMembershipApi";

import { EVENT_ROLES } from "../../shared/eventRoles";

/* ==================================================
   MEMBERSHIP MANAGEMENT HOOK
   Handles organizer membership management actions

   Actions:
   - promote member
   - demote member
   - remove member
   - transfer event ownership
   - refresh data after mutations
================================================== */

export default function useMembershipManagement({
    eventId,
    loadData,
    setMessage,
    setError
}) {
    // Promotes a participant to co-organizer
    const handlePromoteMember = async (userId) => {
        try {
            setMessage("");
            setError("");

            await updateEventMemberRole(eventId, userId, EVENT_ROLES.CO_ORGANIZER);

            setMessage("✅ User promoted to co-organizer");

            await loadData();
        } catch (error) {
            console.error("Error promoting user:", error);
            setError("❌ Unable to promote user");
        }
    };

    // Demotes a co-organizer to participant
    const handleDemoteMember = async (userId) => {
        try {
            setMessage("");
            setError("");

            await updateEventMemberRole(eventId, userId, EVENT_ROLES.PARTICIPANT);

            setMessage("⬇️ User demoted to participant");

            await loadData();
        } catch (error) {
            console.error("Error demoting user:", error);
            setError("❌ Unable to demote user");
        }
    };

    // Removes a member from the event
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

    // Transfers event ownership to another member
    const handleTransferOwnership = async (targetUserId) => {
        const confirmed = window.confirm("Are you sure you want to transfer ownership of this event?");

        if (!confirmed) return;

        try {
            setMessage("");
            setError("");

            await transferEventOwnership(eventId, targetUserId);

            setMessage("👑 Event ownership transferred successfully");

            await loadData();
        } catch (error) {
            console.error("Error transferring ownership:", error);
            setError("❌ Unable to transfer ownership");
        }
    };

    return {
        handlePromoteMember,
        handleDemoteMember,
        handleRemoveMember,
        handleTransferOwnership
    };
}
