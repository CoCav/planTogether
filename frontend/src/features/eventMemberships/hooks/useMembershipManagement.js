import { getApiErrorMessage } from "../../../api/apiError";

import {
    removeEventMember,
    transferEventOwnership,
    updateEventMemberRole
} from "../../../api/eventMemberships/eventMembershipApi";

import { EVENT_ROLES } from "../../shared/constants/eventRoles";

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

    /* =============================
       ROLE MANAGEMENT
    ============================= */

    // Promotes a participant to co-organizer
    const handlePromoteMember = async (userId) => {
        try {
            setMessage("");
            setError("");

            await updateEventMemberRole(
                eventId,
                userId,
                EVENT_ROLES.CO_ORGANIZER
            );

            setMessage("✅ User promoted to co-organizer");

            await loadData();
        } catch (error) {
            setError(getApiErrorMessage(error, "❌ Unable to promote user"));
        }
    };

    // Demotes a co-organizer to participant
    const handleDemoteMember = async (userId) => {
        try {
            setMessage("");
            setError("");

            await updateEventMemberRole(
                eventId,
                userId,
                EVENT_ROLES.PARTICIPANT
            );

            setMessage("⬇️ User demoted to participant");

            await loadData();
        } catch (error) {
            setError(getApiErrorMessage(error, "❌ Unable to demote user"));
        }
    };

    /* =============================
       MEMBER REMOVAL
    ============================= */

    // Removes a member from the event
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

            await loadData();
        } catch (error) {
            setError(getApiErrorMessage(
                error,
                "❌ Unable to remove member"
            ));
        }
    };

    /* =============================
       OWNERSHIP TRANSFER
    ============================= */

    // Transfers event ownership to another member
    const handleTransferOwnership = async (targetUserId) => {
        const confirmed = window.confirm(
            "Are you sure you want to transfer ownership of this event?"
        );

        if (!confirmed) return;

        try {
            setMessage("");
            setError("");

            await transferEventOwnership(eventId, targetUserId);

            setMessage("👑 Event ownership transferred successfully");

            await loadData();
        } catch (error) {
            setError(getApiErrorMessage(
                error,
                "❌ Unable to transfer ownership"
            ));
        }
    };

    return {
        handlePromoteMember,
        handleDemoteMember,
        handleRemoveMember,
        handleTransferOwnership
    };
}
