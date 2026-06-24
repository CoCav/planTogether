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

   Notes:
   - uses toast feedback for temporary action messages
   - window.confirm is kept for destructive or sensitive actions
================================================== */

export default function useMembershipManagement({
    eventId,
    loadData,
    toast
}) {

    /* =============================
       ROLE MANAGEMENT
    ============================= */

    // Promotes a participant to co-organizer
    const handlePromoteMember = async (userId) => {
        try {
            await updateEventMemberRole(
                eventId,
                userId,
                EVENT_ROLES.CO_ORGANIZER
            );

            toast.success("Member promoted.");

            await loadData();
        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to promote user"));
        }
    };

    // Demotes a co-organizer to participant
    const handleDemoteMember = async (userId) => {
        try {
            await updateEventMemberRole(
                eventId,
                userId,
                EVENT_ROLES.PARTICIPANT
            );

            toast.success("Member demoted.");

            await loadData();
        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to demote user"));
        }
    };

    /* =============================
       MEMBER REMOVAL
    ============================= */

    // Removes a member from the event after confirmation
    const handleRemoveMember = async (userId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this member from the event?"
        );

        if (!confirmed) return;

        try {
            await removeEventMember(eventId, userId);

            toast.success("Member removed.");

            await loadData();
        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to remove member"));
        }
    };

    /* =============================
       OWNERSHIP TRANSFER
    ============================= */

    // Transfers event ownership to another member after confirmation
    const handleTransferOwnership = async (targetUserId) => {
        const confirmed = window.confirm(
            "Are you sure you want to transfer ownership of this event?"
        );

        if (!confirmed) return;

        try {
            await transferEventOwnership(eventId, targetUserId);

            toast.success("Ownership transferred.");

            await loadData();
        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to transfer ownership"));
        }
    };

    return {
        handlePromoteMember,
        handleDemoteMember,
        handleRemoveMember,
        handleTransferOwnership
    };
}
